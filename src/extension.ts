'use strict';

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { platform } from 'os';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.restartAndEnableProposedApi', () => {
        vscode.window
            .showWarningMessage('This command will forcefully close all VS Code windows. Are you sure you want to continue?', ...['Yes', 'No'])
            .then((value) => {
                if (value === 'Yes') {
                    restartAndEnableProposedApi();
                }
            });
    });

    context.subscriptions.push(disposable);
}

function findElegiblePackageJson(): any {
    const packageJsonFilePath = `${vscode.workspace.rootPath}/package.json`;

    if (!vscode.workspace.rootPath) throw new Error('There\'s no opened project');
    if (!existsSync(packageJsonFilePath)) throw new Error('There\'s no package.json file');
    
    const packageJson = JSON.parse(readFileSync(packageJsonFilePath).toString());
    if (!packageJson.enableProposedApi) {
        throw new Error('The current project doesn\'t use the Proposed API (See https://code.visualstudio.com/api/advanced-topics/using-proposed-api)');
    }
    
    return packageJson;
}

function restartAndEnableProposedApi(): void {
    try {
        const packageJson = findElegiblePackageJson();
        
        if (platform() === 'darwin') {
            const restartCommand = `ps -e -o pid,command | grep 'Visual Studio Code.app' | cut -d ' ' -f 1 | xargs -L1 kill -9 & sleep 1 & code -n --enable-proposed-api ${packageJson.publisher}.${packageJson.name} ${vscode.workspace.rootPath}`;
            spawn('sh', ['-c', `osascript -e "tell application \\"Terminal\\" to do script \\"${restartCommand}\\""`]);
        }
        else {
            throw new Error('This extension currently works only in macOS');
        }
    }
    catch (err) {
        vscode.window.showErrorMessage(err.message);
    }
}

export function deactivate() {
}