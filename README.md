# sap-cpi-groovy-script README

This extension allows you to run SAP CPI Groovy scripts in a local environment within Visual Studio Code. It provides a convenient way to test and debug your Groovy scripts before deploying them to SAP Cloud Integration.

## Features

- Execute SAP CPI Groovy scripts locally
- Syntax highlighting and IntelliSense for Groovy scripts
- Logging and debugging support
- Seamless integration with Visual Studio Code

## Requirements

- Visual Studio Code installed
- Groovy installed and configured
- Java (JDK 8 or later) installed and set up

## Extension Settings

This extension contributes the following settings:

* `sapCpiGroovy.groovyPath`: Path to the Groovy installation.
* `sapCpiGroovy.enableLogging`: Enable or disable logging for script execution.
* `sapCpiGroovy.debugMode`: Enable debug mode for detailed output.

## Known Issues

- Some complex SAP CPI-specific libraries may not behave exactly as in the cloud environment.
- Ensure correct Java and Groovy setup to avoid compatibility issues.

## Release Notes

### 1.0.0

- Initial release with support for running SAP CPI Groovy scripts locally.

## For more information

For more details, check out:

* [Visual Studio Code Extensions Guide](https://code.visualstudio.com/api/extension-guides/overview)
* [Groovy Language Documentation](http://groovy-lang.org/documentation.html)

**Happy Coding!**
