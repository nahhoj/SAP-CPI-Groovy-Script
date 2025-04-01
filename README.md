# sap-cpi-groovy-script README

This extension allows you to run SAP CPI Groovy scripts in a local environment within Visual Studio Code. It provides a convenient way to test your Groovy scripts before deploying them to SAP Cloud Integration.

## Features

- Execute SAP CPI Groovy scripts locally
- Syntax highlighting and IntelliSense for Groovy scripts
- Seamless integration with Visual Studio Code

## Requirements

- Visual Studio Code installed
- Groovy installed and configured
- Java (JDK 8 or later) installed and set up

[![Watch Demo](https://img.youtube.com/vi/08L74ywNQ_0/0.jpg)](https://www.youtube.com/watch?v=08L74ywNQ_0)

## Extension Settings

This extension contributes the following settings:

* `groovy.java.home`: Path to the JDK folder (you don’t need to install it, just specify where the JDK is located).
* `groovy.groovy.home`: Path to the Groovy folder.
* `groovy.classpath`: Paths to external libraries (JAR files).
* `groovy.keystore.path`: Path to the JKS file.
* `groovy.keystore.password`: Password for the JKS file.
* `groovy.valuemapping.path`: valuemapping objects in ZIP format.


## Release Notes

### 1.0.2

- Initial release with support for running SAP CPI Groovy scripts locally.

## For more information

For more details, check out:

* [Github repository](https://github.com/nahhoj/SAP-CPI-Groovy-Script.git)
* [Visual Studio Code Extensions Guide](https://code.visualstudio.com/api/extension-guides/overview)
* [Groovy Language Documentation](http://groovy-lang.org/documentation.html)

**Happy Coding!**
