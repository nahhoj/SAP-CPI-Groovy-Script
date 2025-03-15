const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const {LanguageClient} = require('vscode-languageclient/node');
const { State } = require('vscode-languageclient');
const { exec } = require('child_process');

let languageClient;

let homeJDK;

const extensionsInfo=vscode.extensions.getExtension('myself.sap-cpi-groovy-script');
const config = vscode.workspace.getConfiguration("groovy");
const outputChannel = vscode.window.createOutputChannel('SAP CPI Groovy Script');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {	
	context.subscriptions.push(vscode.commands.registerCommand('sap-cpi-groovy-script.restartServer', await restartServer));
	context.subscriptions.push(vscode.commands.registerCommand('sap-cpi-groovy-script.runSAPCPIGroovyScript', await runSAPCPIGroovyScript));	
	await restartServer();
}

async function restartServer(){
	homeJDK=checkJavaInstalled();
	if (homeJDK.java== undefined && homeJDK.groovy){
		vscode.window.showErrorMessage('Java and Groovy not found, please configure it in SAP CPI Groovy script settings');
	}
	else if (homeJDK.java== undefined){
		vscode.window.showErrorMessage('Java not found, please configure it in SAP CPI Groovy script settings');
	}
	else if (homeJDK.groovy== undefined){		
		vscode.window.showErrorMessage('Groovy not found, please configure it in SAP CPI Groovy script settings');	
	}
	else{
		if (languageClient){
			try{	
				await languageClient.restart();
				vscode.window.showInformationMessage('SAP CPI Groovy Script is ready!');			
			}
			catch(err){
				vscode.window.showErrorMessage(err.message);
			}
			return;
		}
		const lspPath = path.join(extensionsInfo.extensionPath,"resources","groovy-language-server-all.jar");
		let executable = {
			command: path.join(homeJDK.java,"bin","java"), 
			args: ['-jar',lspPath]
		};
		
		const clientOptions={
			documentSelector: [{ scheme: "file", language: "groovy" }],
			synchronize: {
				configurationSection: "groovy",
			}		
		};
		languageClient = new LanguageClient(
			"groovy",
			"Groovy Language Server",
			executable,
			clientOptions
		  );
		try{	
			await languageClient.start();
			vscode.window.showInformationMessage('SAP CPI Groovy Script is ready!');			
		}
		catch(err){
			vscode.window.showErrorMessage(err.message);
		}		
	}
}

async function runSAPCPIGroovyScript(){	
	if (languageClient?.state != State.Running){
		vscode.window.showErrorMessage("SAP CPI Groovy Script is not ready")
		return;
	}
	let method = await vscode.window.showInputBox({
		prompt: 'Please specify the method you wish to execute.'
	});
	const inFile= vscode.window.activeTextEditor.document.fileName.replace(vscode.window.activeTextEditor.document.fileName.split(process.platform=="win32"?"\\":"/").pop(),"in");
	process.env.groovy_script = vscode.window.activeTextEditor.document.fileName;
	if (fileExists(inFile)){
		const files=await fs.readdirSync(path.resolve(inFile));
		const headerFile=files.find(file=>file.includes(".header"));
		if (headerFile)
			process.env.sapcpi_headers = path.join(inFile,headerFile);
		const propertiesFile=files.find(file=>file.includes(".properties"));
		if (propertiesFile)
			process.env.sapcpi_properties = path.join(inFile,propertiesFile);
		const bodyFile=files.find(file=>file.includes(".body"));
		if (bodyFile)
			process.env.sapcpi_body = path.join(inFile,bodyFile);
	}
	process.env.sapcpi_method = method==''?'processData':method;
	
	//JSK Module
	process.env.keystorePath = config.get("keystore.path");
	process.env.keystorePassword = config.get("keystore.password");
	const sepatator=process.platform=="win32"?";":":";
	const envVariables = {
		...process.env,
		PATH: `${process.env.PATH}${sepatator}${path.join(homeJDK.java,"bin")}${sepatator}${path.join(homeJDK.groovy,"bin")}`
	};
	const command = `groovy -cp "${homeJDK.classPath.join(sepatator)}" "${path.join(extensionsInfo.extensionPath,"resources","main.groovy")}"`;
	exec((command),{ env: envVariables },(err,stdout,stderr)=>{
		if (err){
			outputChannel.appendLine(err.message);
			outputChannel.appendLine(stderr);
		}		
		else
			outputChannel.appendLine(stdout);
	});
	outputChannel.show();
}

function checkJavaInstalled(){	
	let java=config.get("java.home",null);
	let groovy=config.get("groovy.home",null);
	let classPath=config.get("classpath",null)==null?[]:config.get("classpath",null);
	const localJars=`${path.join(extensionsInfo.extensionPath,"resources","libs")}`;
	if (!classPath.find(it=>it==localJars)){
		classPath.push(localJars);
		config.update("classpath",[...classPath],vscode.ConfigurationTarget.Global);
	}
	classPath=classPath.map(it=>path.join(it,"*"));
	if (!fileExists(path.resolve(java)))
		java=undefined;
	if (!fileExists(path.resolve(groovy)))
		groovy=undefined;
	return {java,groovy,classPath};
}

function fileExists(filePath){
	try{
		fs.accessSync(filePath,fs.constants.F_OK);
		return true;
	}
	catch(err){
		return false;
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}