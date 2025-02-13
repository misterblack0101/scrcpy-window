import * as vscode from 'vscode';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    console.log('✅ Scrcpy extension activated!');

    let panel: vscode.WebviewPanel | undefined;
    let scrcpyProcess: child_process.ChildProcessWithoutNullStreams | undefined;

    const disposable = vscode.commands.registerCommand('scrcpy-vscode.start', () => {
        if (!panel) {
            panel = vscode.window.createWebviewPanel(
                'scrcpyPanel',
                'Scrcpy Mirror',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
            panel.webview.html = getWebviewContent();

            // Listen for messages from the webview
            panel.webview.onDidReceiveMessage((message) => {
                console.log('📩 Received message from webview:', message);

                if (message.command === 'attachDevice') {
                    vscode.window.showInformationMessage('Attach Device button clicked! Starting Scrcpy...');
                    startScrcpy();
                }
            });

            panel.onDidDispose(() => {
                panel = undefined;
                stopScrcpy();
            }, null, context.subscriptions);
        } else {
            panel.reveal(vscode.ViewColumn.One);
        }
    });

    context.subscriptions.push(disposable);

    function startScrcpy() {
        if (scrcpyProcess) {
            vscode.window.showInformationMessage('Scrcpy is already running.');
            return;
        }

        vscode.window.showInformationMessage('Starting Scrcpy...');

        scrcpyProcess = child_process.spawn('scrcpy', ['--window-borderless'], { shell: true });

        scrcpyProcess.on('error', (err) => {
            vscode.window.showErrorMessage(`Failed to start Scrcpy: ${err.message}`);
        });

        scrcpyProcess.on('exit', (code) => {
            scrcpyProcess = undefined;
            vscode.window.showInformationMessage(`Scrcpy exited with code ${code}`);
        });
    }

    function stopScrcpy() {
        if (scrcpyProcess) {
            scrcpyProcess.kill();
            scrcpyProcess = undefined;
            vscode.window.showInformationMessage('Scrcpy stopped.');
        }
    }
}

export function deactivate() { }

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
            const vscode = acquireVsCodeApi();

            document.getElementById('attach').addEventListener('click', () => {
                console.log('✅ Button clicked: Sending attachDevice command');
                vscode.postMessage({ command: 'attachDevice' });
            });

            window.addEventListener('message', event => {
                console.log('🟡 Message received in webview:', event.data);
            });
        </script>

        // <script>
        //     const vscode = acquireVsCodeApi();
        //     document.getElementById('attach').addEventListener('click', () => {
        //         vscode.postMessage({ command: 'attachDevice' });
        //     });
        // </script>
    </body>
    </html>`;
}
