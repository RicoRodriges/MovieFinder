export function setCookie(name: string, value: string, options: Record<string, any> = {}): void {
  options = {
    path: '/',
    ...options,
  };

  if (options.expires && options.expires.toUTCString) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  for (const [optionKey, optionValue] of Object.entries(options)) {
    updatedCookie += `; ${optionKey}`;
    if (optionValue !== true) {
      updatedCookie += `=${optionValue}`;
    }
  }
  document.cookie = updatedCookie;
}

export function deleteCookie(name: string): void {
  setCookie(name, '', {
    'max-age': -1,
  });
}

export function getCookie(name: string): string | undefined {
  const matches = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`,
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
