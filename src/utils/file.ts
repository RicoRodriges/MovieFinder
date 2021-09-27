export function download(data: BlobPart, filename: string, type = 'text/plain'): void {
  const fileContent = new Blob([data], { type });
  const a = document.createElement('a');
  const url = URL.createObjectURL(fileContent);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

export async function upload(): Promise<File> {
  const el = document.createElement('input');
  el.setAttribute('type', 'file');
  el.style.display = 'none';
  document.body.append(el);
  return new Promise((res, rej) => {
    const listener = (e: Event) => {
      const { files } = e.target as HTMLInputElement;
      if (files && files.length) {
        res(files[0]);
      } else {
        rej();
      }
      el.removeEventListener('change', listener);
      el.remove();
    };
    el.addEventListener('change', listener);
    el.click();
  });
}

export async function uploadText(): Promise<string> {
  return upload().then((f) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = (evt) => {
      if (evt.target?.readyState === FileReader.DONE) {
        res(evt.target.result as string);
      } else {
        rej();
      }
    };
    reader.readAsText(f);
  }));
}
