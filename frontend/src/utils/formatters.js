export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getDayName(dayNumber) {
  const names = {
    1: 'Thứ Hai',
    2: 'Thứ Ba',
    3: 'Thứ Tư',
    4: 'Thứ Năm',
    5: 'Thứ Sáu',
    6: 'Thứ Bảy',
    7: 'Chủ Nhật'
  };
  return names[dayNumber] || `Thứ ${dayNumber}`;
}

export function extractTimeStr(isoOrTime) {
  if (!isoOrTime) return '';
  const str = String(isoOrTime);
  if (str.includes('T') && str.length >= 16) {
    return str.substring(11, 16);
  }
  return str.slice(0, 5);
}

export function formatBookingTimeSlots(booking) {
  if (!booking) return '';
  if (Array.isArray(booking.items) && booking.items.length > 0) {
    return booking.items
      .map((item) => `${extractTimeStr(item.startAt)} - ${extractTimeStr(item.endAt)}`)
      .join(', ');
  }
  if (booking.startAt && booking.endAt) {
    return `${extractTimeStr(booking.startAt)} - ${extractTimeStr(booking.endAt)}`;
  }
  return 'Chưa xác định';
}


