'use strict';

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.restartAndEnableProposedApi', () => {
        try {
            const packageJson = findElegiblePackageJson();
            const restartCommand = `ps -e -o pid,command | grep 'Visual Studio Code.app' | cut -d ' ' -f 1 | xargs -L1 kill -9 & sleep 1 & code -n --enable-proposed-api ${packageJson.publisher}.${packageJson.name} ${vscode.workspace.rootPath}`;
            spawn('sh', ['-c', `osascript -e "tell application \\"Terminal\\" to do script \\"${restartCommand}\\""`]);
        }
        catch (err) {
            console.log(err);
        }
    });

    context.subscriptions.push(disposable);
}

function findElegiblePackageJson(): any {
    const packageJsonFilePath = `${vscode.workspace.rootPath}/package.json`;
    const packageJson = JSON.parse(readFileSync(packageJsonFilePath).toString());
    if (!packageJson.enableProposedApi) throw new Error('The current project doesn\'t use the Proposed API');
    return packageJson;
}

export function deactivate() {
}