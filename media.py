import os
import secrets
import time
from datetime import datetime
from pathlib import Path

from flask import current_app

MAX_IMAGE_BYTES = 12 * 1024 * 1024
ALLOWED_SUFFIXES = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def get_upload_dir():
    path = current_app.config['GALLERY_UPLOAD_DIR']
    os.makedirs(path, exist_ok=True)
    return path


def detect_image_ext(header):
    if header.startswith(b'\xff\xd8\xff'):
        return 'jpg'
    if header.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'png'
    if header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
        return 'gif'
    if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
        return 'webp'
    return None


def format_size(num_bytes):
    if num_bytes < 1024:
        return f'{num_bytes} Б'
    kb = num_bytes / 1024
    if kb < 1024:
        return f'{kb:.1f} КБ'
    return f'{kb / 1024:.1f} МБ'


def save_upload(file_storage):
    if not file_storage or not file_storage.filename:
        return None, 'Выберите файл изображения'

    data = file_storage.read(MAX_IMAGE_BYTES + 1)
    if not data:
        return None, 'Файл пустой'
    if len(data) > MAX_IMAGE_BYTES:
        return None, 'Файл больше 12 МБ'

    ext = detect_image_ext(data[:32])
    if not ext:
        return None, 'Можно загружать только JPG, PNG, WEBP или GIF'

    filename = f'{int(time.time())}_{secrets.token_hex(4)}.{ext}'
    dest = Path(get_upload_dir()) / filename
    dest.write_bytes(data)
    return filename, None


def list_uploads():
    folder = Path(get_upload_dir())
    items = []
    for path in folder.iterdir():
        if not path.is_file() or path.suffix.lower() not in ALLOWED_SUFFIXES:
            continue
        stat = path.stat()
        items.append({
            'filename': path.name,
            'url': f'/uploads/{path.name}',
            'size_label': format_size(stat.st_size),
            'modified_at': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
        })
    items.sort(key=lambda item: item['modified_at'], reverse=True)
    return items


def delete_upload(filename):
    if not filename or '/' in filename or '\\' in filename or filename in {'.', '..'}:
        return False

    base = Path(get_upload_dir()).resolve()
    target = (base / filename).resolve()
    try:
        target.relative_to(base)
    except ValueError:
        return False

    if not target.is_file() or target.suffix.lower() not in ALLOWED_SUFFIXES:
        return False

    target.unlink()
    return True
