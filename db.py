import os
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta

import bleach
from flask import current_app

ALLOWED_TAGS = [
    'p', 'br', 'h2', 'h3', 'h4',
    'ul', 'ol', 'li',
    'a', 'img',
    'strong', 'em', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'figure', 'figcaption',
    'span', 'div',
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'th': ['colspan', 'rowspan'],
    'td': ['colspan', 'rowspan'],
}

TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
}


def get_db_path():
    return current_app.config['ARTICLES_DB_PATH']


@contextmanager
def get_db():
    path = get_db_path()
    db_dir = os.path.dirname(os.path.abspath(path))
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    conn = sqlite3.connect(path, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('PRAGMA foreign_keys=ON')
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                excerpt TEXT NOT NULL DEFAULT '',
                body_html TEXT NOT NULL DEFAULT '',
                cover_url TEXT NOT NULL DEFAULT '',
                meta_keywords TEXT NOT NULL DEFAULT '',
                is_published INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            '''
        )
        columns = {
            row[1]
            for row in conn.execute('PRAGMA table_info(articles)').fetchall()
        }
        if 'cover_url' not in columns:
            conn.execute(
                "ALTER TABLE articles ADD COLUMN cover_url TEXT NOT NULL DEFAULT ''"
            )
        if 'meta_keywords' not in columns:
            conn.execute(
                "ALTER TABLE articles ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT ''"
            )
        if 'topic_id' not in columns:
            conn.execute('ALTER TABLE articles ADD COLUMN topic_id INTEGER')
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            )
            '''
        )
        conn.execute(
            '''
            CREATE INDEX IF NOT EXISTS idx_articles_published
            ON articles (is_published, created_at DESC)
            '''
        )
        _seed_default_topics(conn)
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                excerpt TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                vk_url TEXT NOT NULL,
                vk_hash TEXT NOT NULL DEFAULT '',
                embed_html TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            '''
        )
        video_columns = {
            row[1]
            for row in conn.execute('PRAGMA table_info(videos)').fetchall()
        }
        if 'vk_hash' not in video_columns:
            conn.execute(
                "ALTER TABLE videos ADD COLUMN vk_hash TEXT NOT NULL DEFAULT ''"
            )
        if 'poster_url' not in video_columns:
            conn.execute(
                "ALTER TABLE videos ADD COLUMN poster_url TEXT NOT NULL DEFAULT ''"
            )
        if 'player_url' not in video_columns:
            conn.execute(
                "ALTER TABLE videos ADD COLUMN player_url TEXT NOT NULL DEFAULT ''"
            )
        if 'embed_html' not in video_columns:
            conn.execute(
                "ALTER TABLE videos ADD COLUMN embed_html TEXT NOT NULL DEFAULT ''"
            )
        _seed_default_videos(conn)
        _sync_known_videos(conn)


def _row_to_dict(row):
    if row is None:
        return None
    data = dict(row)
    data['is_published'] = bool(data['is_published'])
    cover = sanitize_cover_url(data.get('cover_url') or '')
    data['cover_url'] = cover or ''
    data['meta_keywords'] = sanitize_meta_keywords(data.get('meta_keywords') or '')
    topic_id = data.get('topic_id')
    data['topic_id'] = int(topic_id) if topic_id not in (None, '') else None
    return data


DEFAULT_TOPICS = (
    ('Тревога и настроение', 'trevoga-i-nastroenie'),
    ('Семья и отношения', 'semya-i-otnosheniya'),
    ('Детям и подросткам', 'detyam-i-podrostkam'),
)

ARTICLE_SELECT = '''
    SELECT articles.*,
           topics.title AS topic_title,
           topics.slug AS topic_slug
    FROM articles
    LEFT JOIN topics ON topics.id = articles.topic_id
'''


def _topic_row(row):
    if row is None:
        return None
    return dict(row)


def _seed_default_topics(conn):
    count = conn.execute('SELECT COUNT(*) FROM topics').fetchone()[0]
    if count:
        return
    for index, (title, slug) in enumerate(DEFAULT_TOPICS, start=1):
        conn.execute(
            'INSERT INTO topics (slug, title, sort_order) VALUES (?, ?, ?)',
            (slug, title, index),
        )


def list_topics():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT * FROM topics ORDER BY sort_order ASC, id ASC'
        ).fetchall()
    return [_topic_row(row) for row in rows]


def get_topic(topic_id):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM topics WHERE id = ?', (topic_id,)).fetchone()
    return _topic_row(row)


def get_topic_by_slug(slug):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM topics WHERE slug = ?', (slug,)).fetchone()
    return _topic_row(row)


def ensure_unique_topic_slug(slug, exclude_id=None):
    base = slug
    suffix = 2
    while True:
        existing = get_topic_by_slug(slug)
        if existing is None or existing['id'] == exclude_id:
            return slug
        slug = f'{base[:70]}-{suffix}'
        suffix += 1


def create_topic(title):
    title = (title or '').strip()[:120]
    if not title:
        return None, 'Укажите название темы'
    slug = ensure_unique_topic_slug(slugify(title))
    with get_db() as conn:
        max_order = conn.execute('SELECT COALESCE(MAX(sort_order), 0) FROM topics').fetchone()[0]
        cursor = conn.execute(
            'INSERT INTO topics (slug, title, sort_order) VALUES (?, ?, ?)',
            (slug, title, max_order + 1),
        )
        return cursor.lastrowid, None


def update_topic(topic_id, title):
    title = (title or '').strip()[:120]
    if not title:
        return 'Укажите название темы'
    if not get_topic(topic_id):
        return 'Тема не найдена'
    with get_db() as conn:
        conn.execute('UPDATE topics SET title = ? WHERE id = ?', (title, topic_id))
    return None


def delete_topic(topic_id):
    if not get_topic(topic_id):
        return False
    with get_db() as conn:
        conn.execute('UPDATE articles SET topic_id = NULL WHERE topic_id = ?', (topic_id,))
        conn.execute('DELETE FROM topics WHERE id = ?', (topic_id,))
    return True


def slugify(text):
    text = (text or '').strip().lower()
    parts = []
    for char in text:
        if char in TRANSLIT_MAP:
            parts.append(TRANSLIT_MAP[char])
        elif char.isascii() and char.isalnum():
            parts.append(char)
        elif char in '-_':
            parts.append('-')
        else:
            parts.append('-')
    slug = re.sub(r'-{2,}', '-', ''.join(parts)).strip('-')
    return slug[:80] or 'statya'


def sanitize_html(html):
    html = html or ''
    html = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', html, flags=re.I)
    html = re.sub(r'<style\b[^>]*>[\s\S]*?</style>', '', html, flags=re.I)
    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=['http', 'https', 'mailto', 'tel'],
        strip=True,
    )


def sanitize_meta_keywords(raw):
    text = bleach.clean(raw or '', tags=[], attributes={}, strip=True)
    text = re.sub(r'[\r\n\t]+', ' ', text)
    parts = [part.strip(' .;') for part in text.split(',')]
    parts = [part for part in parts if part]
    return ', '.join(parts)[:500]


def sanitize_cover_url(url):
    url = (url or '').strip()
    if not url:
        return ''
    if len(url) > 2000:
        return None
    if url.startswith('/static/') or url.startswith('/uploads/'):
        if '..' in url or any(ch in url for ch in ' \n\r\t<>"\''):
            return None
        return url
    parsed = re.match(r'^https?://[^\s<>"\']+$', url, flags=re.I)
    if not parsed:
        return None
    return url


def _now():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def list_articles():
    with get_db() as conn:
        rows = conn.execute(
            ARTICLE_SELECT + ' ORDER BY datetime(articles.updated_at) DESC, articles.id DESC'
        ).fetchall()
    return [_row_to_dict(row) for row in rows]


def list_published_articles(topic_slug=None):
    query = ARTICLE_SELECT + ' WHERE articles.is_published = 1'
    params = []
    if topic_slug:
        query += ' AND topics.slug = ?'
        params.append(topic_slug)
    query += ' ORDER BY datetime(articles.created_at) DESC, articles.id DESC'
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_row_to_dict(row) for row in rows]


def get_article(article_id):
    with get_db() as conn:
        row = conn.execute(
            ARTICLE_SELECT + ' WHERE articles.id = ?',
            (article_id,),
        ).fetchone()
    return _row_to_dict(row)


def get_article_by_slug(slug, published_only=True):
    query = ARTICLE_SELECT + ' WHERE articles.slug = ?'
    params = [slug]
    if published_only:
        query += ' AND articles.is_published = 1'
    with get_db() as conn:
        row = conn.execute(query, params).fetchone()
    return _row_to_dict(row)


def ensure_unique_slug(slug, exclude_id=None):
    base = slug
    suffix = 2
    while True:
        existing = get_article_by_slug(slug, published_only=False)
        if existing is None or existing['id'] == exclude_id:
            return slug
        slug = f'{base[:70]}-{suffix}'
        suffix += 1


def create_article(title, slug, excerpt, body_html, cover_url, meta_keywords, topic_id, is_published):
    now = _now()
    with get_db() as conn:
        cursor = conn.execute(
            '''
            INSERT INTO articles (
                slug, title, excerpt, body_html, cover_url, meta_keywords,
                topic_id, is_published, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                slug,
                title,
                excerpt,
                body_html,
                cover_url,
                meta_keywords,
                topic_id,
                1 if is_published else 0,
                now,
                now,
            ),
        )
        return cursor.lastrowid


def update_article(article_id, title, slug, excerpt, body_html, cover_url, meta_keywords, topic_id, is_published):
    with get_db() as conn:
        conn.execute(
            '''
            UPDATE articles
            SET slug = ?, title = ?, excerpt = ?, body_html = ?, cover_url = ?,
                meta_keywords = ?, topic_id = ?, is_published = ?, updated_at = ?
            WHERE id = ?
            ''',
            (
                slug,
                title,
                excerpt,
                body_html,
                cover_url,
                meta_keywords,
                topic_id,
                1 if is_published else 0,
                _now(),
                article_id,
            ),
        )


def delete_article(article_id):
    with get_db() as conn:
        conn.execute('DELETE FROM articles WHERE id = ?', (article_id,))


DEFAULT_VIDEOS = (
    (
        'Меня нельзя загипнотизировать — у меня сильная воля',
        'Один из самых распространённых мифов о гипнозе. Гипнотерапия — это сотрудничество, а не борьба воли.',
        (
            '«Меня нельзя загипнотизировать — у меня сильная воля». Один из самых распространённых мифов о гипнозе звучит именно так. Но гипноз — это не борьба воли клиента и специалиста и не попытка получить контроль над человеком.\n\n'
            'Гипнотерапия — дорога с двусторонним движением. Она предполагает сотрудничество, доверие и готовность клиента включаться в процесс. Поэтому сеанс начинается не с погружения в транс, а с беседы. Специалист объясняет, как работает метод, отвечает на вопросы, обсуждает ожидания и помогает развеять страхи и предубеждения.\n\n'
            'Восприимчивость к гипнозу действительно может различаться. Однако она не определяется «сильной» или «слабой» волей и напрямую не зависит от интеллекта. Значение имеют способность концентрировать внимание, погружаться в образы, доверять процессу, а также мотивация и контакт со специалистом.\n\n'
            'Гипноз — не чудо и не способ полностью изменить жизнь за несколько сеансов. Это научно обоснованный психотерапевтический инструмент, который помогает эффективнее работать с определёнными симптомами и состояниями. Как у любого метода, у него есть свои показания и противопоказания.\n\n'
            'Особенно хорошо гипнотерапия может дополнять когнитивно-поведенческую терапию. КПТ помогает работать с мыслями, убеждениями и действиями, а гипнотерапия — с эмоциональными и автоматическими реакциями.\n\n'
            'Например, тревога не всегда подчиняется логике. Человек может рационально понимать, что реальной опасности нет, но продолжать испытывать сильное напряжение. Одних логических аргументов в таком случае иногда оказывается недостаточно. Работа на эмоциональном уровне помогает снизить интенсивность иррациональной реакции, после чего дальнейшие изменения в мышлении и поведении могут происходить быстрее и легче.\n\n'
            'Гипноз не отменяет психотерапию и не заменяет внутреннюю работу клиента. Он может стать одним из инструментов, который делает эту работу более доступной и эффективной. Главное условие — осознанное сотрудничество со специалистом.\n\n'
            'В кадре – Ивашиненко Дмитрий Михайлович, врач-психиатр, врач-психотерапевт, кандидат медицинских наук, доцент, руководитель Тульского регионального отделения Российской психотерапевтической ассоциации (РПА), заместитель главного врача по лечебной работе Тульской областной клинической психиатрической больницы № 1 им. Н. П. Каменева, руководитель Центра психотерапии и психологического консультирования «Крылья» г. Тула.'
        ),
        '<iframe src="https://vkvideo.ru/video_ext.php?oid=-225740964&id=456239318&hash=6df162e7e66901f1&hd=4" width="1920" height="1080" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>',
    ),
    (
        'Гипноз: магия или медицина?',
        'Клинический гипноз — не магия и не потеря контроля, а научно обоснованный метод работы.',
        (
            'Гипноз — это не магия и не потеря контроля. У многих слово «гипноз» до сих пор вызывает тревогу. Кажется, что гипнотизёр щёлкнет пальцами, и человек потеряет волю, начнёт выполнять любые команды, а потом ещё и ничего не вспомнит.\n\n'
            'Но клинический гипноз — это совсем не то, что мы привыкли видеть в кино или театральных шоу. Гипноз можно описать как особое трансовое состояние — промежуточное между бодрствованием и сном. При этом человек не «отключается» от реальности и не перестаёт думать. Он сохраняет контакт с происходящим, слышит специалиста, может реагировать и внутренне оценивать то, что ему предлагают.\n\n'
            'Важный момент: гипноз не превращает человека в марионетку.\n\n'
            'У нашей психики есть своего рода защита. Если внушение не подходит человеку — когнитивно, эмоционально, морально — оно просто не будет принято и не станет действовать. То есть нельзя просто «заложить» в человека любую установку и заставить его делать то, что противоречит его внутренним ценностям.\n\n'
            'Научно обоснованный гипноз — это не дар, не сверхспособность и не мистический талант. Это метод работы, который может использоваться как часть психотерапевтического процесса. Ему обучаются специалисты помогающих профессий: врачи, психологи, психотерапевты.\n\n'
            'Да, существуют разные трансовые техники, и некоторые люди могут использовать похожие механизмы неэтично — например, для манипуляций. Но это уже не про терапевтический гипноз, а скорее про специальные техники воздействия и внушения.\n\n'
            'Поэтому главный вывод такой: гипноз — это инструмент, а не магия. В профессиональных руках он помогает работать с состояниями, эмоциями, внутренними установками и психическими процессами. Но он не лишает человека разума, воли и способности выбирать.\n\n'
            'На вопросы о гипнозе отвечал Ивашиненко Дмитрий Михайлович — врач-психиатр, врач-психотерапевт, кандидат медицинских наук, доцент, руководитель Тульского регионального отделения Российской психотерапевтической ассоциации (РПА), заместитель главного врача по лечебной работе Тульской областной клинической психиатрической больницы № 1 им. Н. П. Каменева, руководитель Центра психотерапии и психологического консультирования «Крылья» г. Тула.'
        ),
        '<iframe src="https://vkvideo.ru/video_ext.php?oid=-225740964&id=456239306&hash=8fcd1ad398e43ab4&hd=4" width="1920" height="1080" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>',
    ),
    (
        'Этика, стигматизация и СМИ: о чем важно говорить в современной психиатрии?',
        'Почему люди боятся обращаться за психиатрической помощью и как медиа усиливают стигму.',
        (
            'Этика, стигматизация и СМИ: о чем важно говорить в современной психиатрии? В практике нашего центра мы регулярно сталкиваемся с тем, что люди боятся обращаться за психиатрической помощью. Этот страх связан не столько с процессом лечения, сколько с реакцией общества. Сегодня мы хотим открыто поговорить об этике в психиатрии, влиянии медиа и нашей ответственности перед пациентами.\n\n'
            'Главный принцип — добровольность и уважение. Современная психиатрическая помощь вне острых состояний оказывается исключительно добровольно. Человек осознанно обращается к врачу и дает информированное согласие. Но даже в тех редких случаях, когда речь идет о недобровольной госпитализации в состоянии психоза, медицинская этика должна соблюдаться в полном объеме. Диагноз не лишает человека его человеческого достоинства, и уважительное отношение к пациенту — это базовый стандарт, за которым мы строго следим.\n\n'
            'Откуда берется стигматизация? Многие годы психиатрия окружена мифами, которые активно подпитываются в информационном поле.\n\n'
            'Мы понимаем, что снижение уровня стигматизации зависит, в первую очередь, от самих врачей. Недопустимо, когда специалисты нарушают этические нормы.\n\n'
            'Что делаем мы? Мы уверены, что исправить ситуацию можно только через повышение качества нашей работы и просвещение. Задача нашего центра — не просто оказывать медицинскую помощь, но и открыто рассказывать о психических расстройствах, показывать, как пациенты успешно лечатся и адаптируются, выстраивать прозрачный диалог с обществом.\n\n'
            'Если вы или ваши близкие нуждаетесь в помощи, помните: обращение к специалисту — это шаг к качественной жизни, а не повод для стыда. В нашем центре вам гарантированы этичное отношение, конфиденциальность и современный подход к лечению.\n\n'
            'На вопросы об этике в психиатрии отвечали врач-психиатр, врач-психотерапевт, кандидат медицинских наук, доцент, руководитель Тульского регионального отделения Российской психотерапевтической ассоциации (РПА), заместитель главного врача по лечебной работе Тульской областной клинической психиатрической больницы № 1 им. Н. П. Каменева, руководитель Центра психотерапии и психологического консультирования «Крылья» г. Тула Дмитрий Михайлович Ивашиненко, а также вице-президент Российского общества психиатров, президент Союза охраны психического здоровья Наталья Валериевна Треушникова.'
        ),
        '<iframe src="https://vkvideo.ru/video_ext.php?oid=-225740964&id=456239303&hash=4a9be428734b60dd&hd=4" width="1920" height="1080" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>',
    ),
)


def vk_export_iframe(oid, vid, vk_hash, hd=4):
    oid = str(int(oid))
    vid = str(int(vid))
    if not re.fullmatch(r'[a-fA-F0-9]+', vk_hash or ''):
        raise ValueError('bad vk hash')
    hd = int(hd)
    # vkvideo.ru/video_ext.php ломается, если браузер не шлёт Referer
    # (локальный http://127.0.0.1 → https://vkvideo.ru). vk.com открывается и так.
    return (
        f'<iframe src="https://vk.com/video_ext.php?oid={oid}&id={vid}&hash={vk_hash}&hd={hd}" '
        'width="1920" height="1080" '
        'allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" '
        'frameborder="0" allowfullscreen></iframe>'
    )


def parse_vk_video(url):
    url = (url or '').replace('&amp;', '&').strip()
    if not url:
        return None
    if not re.match(r'^https?://', url, flags=re.I):
        return None
    host_ok = re.search(
        r'^https?://(www\.)?(vkvideo\.ru|vk\.com|vk\.ru|m\.vk\.com)/',
        url,
        flags=re.I,
    )
    if not host_ok:
        return None
    match = re.search(r'video(-?\d+)_(\d+)', url, flags=re.I)
    if match:
        oid, vid = match.group(1), match.group(2)
    else:
        oid_match = re.search(r'[?&]oid=(-?\d+)', url)
        vid_match = re.search(r'[?&]id=(\d+)', url)
        if not oid_match or not vid_match:
            return None
        oid, vid = oid_match.group(1), vid_match.group(1)
    hash_match = re.search(r'[?&]hash=([a-fA-F0-9]+)', url)
    vk_hash = hash_match.group(1) if hash_match else ''
    return {
        'vk_oid': oid,
        'vk_id': vid,
        'vk_hash': vk_hash,
        'vk_url': f'https://vkvideo.ru/video{oid}_{vid}',
        'embed_url': (
            f'https://vk.com/video_ext.php?oid={oid}&id={vid}'
            + (f'&hash={vk_hash}' if vk_hash else '')
            + '&hd=4'
        ),
    }


def _extract_iframe_src(raw):
    raw = (raw or '').strip()
    if not raw:
        return ''
    decoded = raw.replace('&amp;', '&')
    if re.match(r'^https?://', decoded, flags=re.I) and 'video_ext.php' in decoded:
        return decoded
    match = re.search(r'<iframe\b[^>]*\bsrc=["\']([^"\']+)["\']', decoded, flags=re.I | re.S)
    return match.group(1).replace('&amp;', '&') if match else ''


def sanitize_embed_html(raw):
    src = _extract_iframe_src(raw)
    if not src:
        return '', '', '', 'Вставьте HTML-код экспорта из ВК: Поделиться → Экспортировать'
    parsed = parse_vk_video(src)
    if not parsed:
        return '', '', '', 'Нужен iframe ВКонтакте (vkvideo.ru или vk.com)'
    vk_hash = parsed.get('vk_hash') or ''
    if not vk_hash:
        return '', '', '', 'В коде экспорта должен быть hash — скопируйте iframe целиком из ВК'
    try:
        embed = vk_export_iframe(parsed['vk_oid'], parsed['vk_id'], vk_hash)
    except (ValueError, TypeError):
        return '', '', '', 'Некорректный код экспорта ВК'
    return embed, parsed['vk_url'], vk_hash, None


def _video_to_dict(row):
    if row is None:
        return None
    data = dict(row)
    embed, vk_url, vk_hash, error = sanitize_embed_html(data.get('embed_html') or '')
    if error:
        parsed = parse_vk_video(data.get('vk_url') or '')
        stored_hash = (data.get('vk_hash') or (parsed or {}).get('vk_hash') or '').strip()
        if parsed and stored_hash:
            try:
                embed = vk_export_iframe(parsed['vk_oid'], parsed['vk_id'], stored_hash)
                vk_url = parsed['vk_url']
                vk_hash = stored_hash
            except (ValueError, TypeError):
                embed, vk_url, vk_hash = '', data.get('vk_url') or '', stored_hash
        else:
            embed = ''
            vk_url = data.get('vk_url') or ''
            vk_hash = stored_hash
    src_match = re.search(r'\bsrc=["\']([^"\']+)["\']', embed)
    data['embed_html'] = embed
    data['vk_url'] = vk_url
    data['vk_hash'] = vk_hash
    data['embed_url'] = src_match.group(1) if src_match else ''
    data['poster_url'] = (data.get('poster_url') or '').strip()
    return data


def _seed_default_videos(conn):
    count = conn.execute('SELECT COUNT(*) FROM videos').fetchone()[0]
    if count:
        return
    base = datetime.now()
    for index, (title, excerpt, description, embed_html) in enumerate(DEFAULT_VIDEOS, start=1):
        created = (base - timedelta(minutes=index - 1)).strftime('%Y-%m-%d %H:%M:%S')
        embed, vk_url, vk_hash, error = sanitize_embed_html(embed_html)
        if error:
            continue
        conn.execute(
            '''
            INSERT INTO videos (
                slug, title, excerpt, description, vk_url, vk_hash, embed_html,
                sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                slugify(title), title, excerpt, description,
                vk_url, vk_hash, embed, index, created, created,
            ),
        )


def _sync_known_videos(conn):
    for title, excerpt, description, embed_html in DEFAULT_VIDEOS:
        embed, vk_url, vk_hash, error = sanitize_embed_html(embed_html)
        if error:
            continue
        parsed = parse_vk_video(vk_url)
        row = conn.execute(
            '''
            SELECT id, slug FROM videos
            WHERE vk_url LIKE ? OR embed_html LIKE ?
            ''',
            (f"%{parsed['vk_id']}%", f"%id={parsed['vk_id']}%"),
        ).fetchone()
        if row is None:
            continue
        slug = slugify(title)
        clash = conn.execute(
            'SELECT id FROM videos WHERE slug = ? AND id != ?',
            (slug, row['id']),
        ).fetchone()
        if clash:
            slug = row['slug']
        conn.execute(
            '''
            UPDATE videos
            SET title = ?, slug = ?, excerpt = ?, description = ?,
                vk_url = ?, vk_hash = ?, embed_html = ?
            WHERE id = ?
            ''',
            (title, slug, excerpt, description, vk_url, vk_hash, embed, row['id']),
        )


def list_videos():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT * FROM videos ORDER BY sort_order ASC, id ASC'
        ).fetchall()
    return [_video_to_dict(row) for row in rows]


def list_latest_videos(limit=3):
    with get_db() as conn:
        rows = conn.execute(
            '''
            SELECT * FROM videos
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT ?
            ''',
            (limit,),
        ).fetchall()
    return [_video_to_dict(row) for row in rows]


def get_video(video_id):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM videos WHERE id = ?', (video_id,)).fetchone()
    return _video_to_dict(row)


def get_video_by_slug(slug):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM videos WHERE slug = ?', (slug,)).fetchone()
    return _video_to_dict(row)


def ensure_unique_video_slug(slug, exclude_id=None):
    base = slug
    suffix = 2
    while True:
        existing = get_video_by_slug(slug)
        if existing is None or existing['id'] == exclude_id:
            return slug
        slug = f'{base[:70]}-{suffix}'
        suffix += 1


def create_video(title, slug, excerpt, description, embed_html):
    now = _now()
    embed, vk_url, vk_hash, error = sanitize_embed_html(embed_html)
    if error:
        raise ValueError(error)
    with get_db() as conn:
        max_order = conn.execute('SELECT COALESCE(MAX(sort_order), 0) FROM videos').fetchone()[0]
        cursor = conn.execute(
            '''
            INSERT INTO videos (
                slug, title, excerpt, description, vk_url, vk_hash, embed_html,
                sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (slug, title, excerpt, description, vk_url, vk_hash, embed, max_order + 1, now, now),
        )
        return cursor.lastrowid


def update_video(video_id, title, slug, excerpt, description, embed_html):
    embed, vk_url, vk_hash, error = sanitize_embed_html(embed_html)
    if error:
        raise ValueError(error)
    with get_db() as conn:
        conn.execute(
            '''
            UPDATE videos
            SET slug = ?, title = ?, excerpt = ?, description = ?,
                vk_url = ?, vk_hash = ?, embed_html = ?, updated_at = ?
            WHERE id = ?
            ''',
            (slug, title, excerpt, description, vk_url, vk_hash, embed, _now(), video_id),
        )


def delete_video(video_id):
    with get_db() as conn:
        conn.execute('DELETE FROM videos WHERE id = ?', (video_id,))


def move_video(video_id, direction):
    videos = list_videos()
    index = next((i for i, item in enumerate(videos) if item['id'] == video_id), None)
    if index is None:
        return False
    neighbor = index - 1 if direction == 'up' else index + 1
    if neighbor < 0 or neighbor >= len(videos):
        return False
    videos[index], videos[neighbor] = videos[neighbor], videos[index]
    with get_db() as conn:
        for order, item in enumerate(videos, start=1):
            conn.execute(
                'UPDATE videos SET sort_order = ? WHERE id = ?',
                (order, item['id']),
            )
    return True
