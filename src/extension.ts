import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Scrcpy extension is now active!');

    let panel: vscode.WebviewPanel | undefined;

    const disposable = vscode.commands.registerCommand('scrcpy-vscode.start', () => {
        vscode.window.showInformationMessage('Scrcpy command executed!');

        if (!panel) {
            panel = vscode.window.createWebviewPanel(
                'scrcpyPanel',
                'Scrcpy Mirror',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
            panel.webview.html = getWebviewContent();

            panel.onDidDispose(() => {
                panel = undefined;
            }, null, context.subscriptions);
        } else {
            panel.reveal(vscode.ViewColumn.One);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Scrcpy Mirror</title>
        <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; }
            button { font-size: 20px; padding: 10px 20px; }
        </style>
    </head>
    <body>
        <button id="attach">Attach Device</button>
        <script>
            document.getElementById('attach').addEventListener('click', () => {
                vscode.postMessage({ command: 'attachDevice' });
            });
        </script>
    </body>
    </html>`;
}
