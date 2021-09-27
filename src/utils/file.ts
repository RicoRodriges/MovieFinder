export function download(data: any, filename: string, type = 'text/plain') {
    const fileContent = new Blob([data], { type });
    if ((window.navigator as any).msSaveOrOpenBlob) { // IE10+
        (window.navigator as any).msSaveOrOpenBlob(fileContent, filename);
    } else {
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
}


export async function upload(): Promise<File> {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.style.display = 'none';
    document.body.append(el);
    return new Promise((res, rej) => {
        const listener = (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
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
    return upload().then(f => {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = (evt: any) => {
                if (evt.target.readyState === FileReader.DONE) {
                    res(evt.target.result);
                } else {
                    rej();
                }
            };
            reader.readAsText(f);
        });
    });
}