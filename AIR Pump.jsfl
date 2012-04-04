/*
*	AIR Pump by Robert M. Hall, II. April 4th, 2012
*	Visit http://www.impossibilities.com/airpump/ for documentation, updates and examples.
*
*	Copyright (c) 2012 Robert M. Hall, II, Inc. dba Feasible Impossibilities - http://www.impossibilities.com/
*	 
*	Permission is hereby granted, free of charge, to any person obtaining a copy
*	of this software and associated documentation files (the "Software"), to deal
*	in the Software without restriction, including without limitation the rights
*	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*	copies of the Software, and to permit persons to whom the Software is
*	furnished to do so, subject to the following conditions:
*	 
*	The above copyright notice and this permission notice shall be included in
*	all copies or substantial portions of the Software.
*	 
*	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*	THE SOFTWARE.
*/

/*  
*	AIR Pump - Version 0.1a - 04.04.12
*	AIR Pump is a JSFL command for Flash Professional IDE that allows for custom AIR adt.jar
*	command line arguments and execution of adt.jar from any version of the AIR SDK to be
*	leveraged directly from the Flash IDE. Thus providing access to AIR adt.jar commands,
*	features and functionality normally only available from the command line and not from
*	within the IDE itself. It is designed to be an aid to workflow and efficiency when
*	working with Flash Professional and AIR, and to assist in automating repetitive, and error prone processes.
*
*   TODO:
*	1. Make sure everything works cross platform
*	2. Additional options and streamlinging of selection process/config/preferences/etc.
*	3. Replace all the XUL Dialogs with a custom SWF for a single panel that replicates all the standard AIR Publish Settings dialog plus the functionality of AIR Pump
*   4. Integrate custom adt.jar shim and other functionality from other related project: http://www.impossibilities.com/v4/2011/06/24/leverage-air-2-7-ipa-test-interpreter-target-mode-for-ios-in-flash-cs-5-5/ 
*	5. Package up in a proper .mxp file for easier installation
*	6. Finish TODO list with other thoughts and ideas
*/


fl.outputPanel.clear();

function showXMLPanel(xmlString)
{
  var tempUrl = fl.configURI + "/Commands/temp-dialog-" + String(parseFloat(Math.random()*1)).replace(".","") + ".xml"
  FLfile.write(tempUrl, xmlString);
  var xmlPanelOutput = fl.xmlPanel(tempUrl); // fl.getDocumentDOM().xmlPanel(tempUrl);
  FLfile.remove(tempUrl);
  return xmlPanelOutput;
}

var docID = fl.getDocumentDOM().id
var fileName = fl.findDocumentDOM(docID).name;
fl.trace("Working with: "+fileName);

var continueCompilation = confirm("Proceed with custom ADT CLI compilation of: "+fileName+" ?");
if (continueCompilation) {
  continueCompilation=true;
} else {
  continueCompilation = false;
}

if(continueCompilation) {
	// Revisit automating this by looking at the current publishing profile info or inspecting the app descriptor for the current open .fla to determine the AIR
	// SDK version, and assume a default location and folder - check it, if not there, then ask instead - revisit...
	// Or simplify and allow selection of just the SDK folder and auto determine the rest of the path - using file path to adt.jar now 
	// to allow selection of custom adt.jar shim replacement
	// Also consider adding some props to the current document, and re-reading those like a cookie - on second pass around
	airADTVersionBrowseResults = fl.browseForFileURL('select', 'Select Your Target AIR SDK ADT.jar file');
	airADTVersionBrowseResults = FLfile.uriToPlatformPath(airADTVersionBrowseResults);
	//fl.trace(airADTVersionBrowseResults);
	
	var dialogXML = '';
	dialogXML +=  '<dialog title="AIR ADT Options" buttons="accept" >';
	dialogXML +=  '<label value="AIR ADT Target Type?" control="adtTargetType" />';	
	dialogXML +=  '<menulist id="adtTargetType"><menupop>';
	dialogXML +=  '<menuitem label="Desktop AIR or AIRI" value="air" selected="true" />';
	dialogXML +=  '<menuitem label="Desktop NATIVE Installer" value="native" />';
	dialogXML +=  '<menuitem label="Desktop Captive Runtime" value="bundle" />';
	dialogXML +=  '<menuitem label="AIR for TV" value="airn" selected="false" />';
	dialogXML +=  '<menuitem label="AIR Native Extension" value="ane" />';
	dialogXML +=  '<menuitem label="Android APK" value="apk" />';
	dialogXML +=  '<menuitem label="Android APK Debug" value="apk-debug" />';
	dialogXML +=  '<menuitem label="Android APK Emulator" value="apk-emulator" />';
	dialogXML +=  '<menuitem label="Android APK Profile" value="apk-profile" />';
	dialogXML +=  '<menuitem label="Android APK Captive Runtime" value="apk-captive-runtime" />';
	dialogXML +=  '<menuitem label="Apple iOS IPA ADHOC" value="ipa-ad-hoc" />';
	dialogXML +=  '<menuitem label="Apple iOS IPA App Store Distro" value="ipa-app-store" />';
	dialogXML +=  '<menuitem label="Apple iOS IPA Debug" value="ipa-debug" />';
	dialogXML +=  '<menuitem label="Apple iOS IPA Test" value="ipa-test" />';
	dialogXML +=  '<menuitem label="Apple iOS IPA Debug Interpreter" value="ipa-debug-interpreter" />';
	dialogXML +=  '<menuitem label="Apple iOS IPA Test Interpreter" value="ipa-test-interpreter" />';
	dialogXML +=  '</menupop></menulist>';
	dialogXML +=  '</dialog>';
	// fl.trace(dialogXML);
	
	
	var adtTargetResults = showXMLPanel(dialogXML);

	var destinationExtension = "";
	
	var adtSwitch=adtTargetResults.adtTargetType.substr(0,3);
	
	switch(adtSwitch) {
		case "air":
			destinationExtension=".air";
			break;
		case "ane":
			destinationExtension=".ane";
			break;
		case "apk":
			destinationExtension=".apk";
			break;
		case "ipa":
			destinationExtension=".ipa";
			break;
		case "nat":
			// need to add in codefor Mac and PC differences
			//destinationExtension=".exe";
			destinationExtension=".dmg";
			break;
		case "bun":
			// need to add in codefor Mac and PC differences
			//destinationExtension="";
			destinationExtension=".app";
			break;
	}
		//fl.trace(destinationExtension);
	
	var platformSDKArgs = "";
	if(destinationExtension ==".apk" || destinationExtension==".ipa" ) {
		
		var usePlatformSDK = confirm("Use custom PlatformSDK option?");
		if(usePlatformSDK) {
			usePlatformSDKPath = fl.browseForFolderURL('Select Your Target Platform SDK');
		}
		platformSDKArgs = " -platformsdk "+FLfile.uriToPlatformPath(usePlatformSDKPath);
		//fl.trace(platformSDKArgs);
	}
	
	


	// Determine app descriptor file name/location automatically based off assumed defaults for now instead of having to select it below
	// appDescriptorBrowseResults = fl.browseForFileURL('select', 'Select Your AIR Application Descriptor File');
	// fl.trace(appDescriptorBrowseResults);
	
	// For now assume a PKCS12 keystore signing type - revisit to add other types and options in more advanced selector, etc.
	var signingKeyURI = fl.browseForFileURL('select', 'Select Your Signing Key');
	//fl.trace("SIGNING KEY PATH: "+signingKeyURI);
	var signingKeyPath = FLfile.uriToPlatformPath(signingKeyURI);
	//fl.trace("SIGNING KEY URI: "+signingKeyPath);

	
	var signingPassword = prompt("Enter Your Signing Key Password", "Type password here");
	
	// Get the path of the current document, then pop off the document part and
	// covert it to a platform specific path.
	var configPath = fl.configURI;
	var path = fl.getDocumentDOM().pathURI;
	var osPath = FLfile.uriToPlatformPath(path);
	
	var filePathURI = fl.findDocumentDOM(docID).pathURI;
		
	var fileDestinationName = filePathURI.substring(filePathURI.lastIndexOf("/")+1, filePathURI.lastIndexOf("."));
	
	var targetDestinationName = fileDestinationName + destinationExtension;
	
	var fileAppXML = fileDestinationName+"-app.xml";
	filePathURI = filePathURI.substr(0,filePathURI.lastIndexOf("/")+1);
	var filePathPath =  FLfile.uriToPlatformPath(filePathURI);

	//fl.trace(filePathURI+ " - "+fileDestinationName);

	var dialogXML = '';
	dialogXML +=  '<dialog title="Execute Custom AIR ADT Command" buttons="accept, cancel" >';
	dialogXML +=  '<label value="ADT cli arguments:" control="adtArgs" />';
	dialogXML +=  '<textbox id="adtArgs" width="800" height="300" maxlength="9950" multiline="true" value="';
	dialogXML +=  "/usr/bin/java -jar '";

	// Next line needs some work depending on the target type and a few other items, to make sure the order of arguments is correct
	// and to allow selection of additional assets to include in package and other options - right now bare bones for most use cases
	// and since you can edit the results in the next step after this confirmation window, it helps

	dialogXML +=  airADTVersionBrowseResults+"' -package -storetype pkcs12 -keystore '"+signingKeyPath+"' -storepass "+signingPassword+" -target "+adtTargetResults.adtTargetType+" '"+filePathPath+targetDestinationName+"' '"+filePathPath+fileAppXML+"' -C '"+filePathPath+"' "+fileDestinationName+".swf"+" "+platformSDKArgs+"\" />";
	dialogXML +=  '</dialog>';
	//fl.trace(dialogXML);


	var adtCLIArgs = showXMLPanel(dialogXML);
			
			if(adtCLIArgs.dismiss == "accept") {
			
			fl.trace("COMPILING: "+filePathURI+fileDestinationName+".swf");
		
			fl.getDocumentDOM().exportSWF(filePathURI+fileDestinationName+".swf", true);
			
			function writeADTAndCompile(adtCLIString) {
				var tempUrl = fl.configURI + "/Commands/temp-ADT-CLR-ARGS-" + String(parseFloat(Math.random()*1)).replace(".","") + ".sh";
				var execUrl = FLfile.uriToPlatformPath(tempUrl)
				// revisit for windows with cmd /c 
				fl.trace("Executing ADT Command: "+adtCLIArgs.adtArgs);
				FLfile.runCommandLine(adtCLIString);
				// save out the script for editing or running again - for future use
				fl.trace("Re-execute that command from here: "+execUrl);
				FLfile.write(tempUrl, '#!/bin/sh\n'+adtCLIString);
				//FLfile.runCommandLine("chmod +x "+arg);
				//FLfile.execShell(execUrl);
				//FLfile.remove(tempUrl);
			}
			
			writeADTAndCompile(adtCLIArgs.adtArgs);
			
			} else{
				// nada - maybe step backwards here or reprompt
			}
}