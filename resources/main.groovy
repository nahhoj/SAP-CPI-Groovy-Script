import com.sap.gateway.ip.core.customdev.processor.MessageImpl
import com.sap.gateway.ip.core.customdev.util.Message
import org.apache.camel.CamelContext
import org.apache.camel.Exchange
import org.apache.camel.impl.DefaultCamelContext
import org.apache.camel.builder.ExchangeBuilder
import local.impl.LocalKeystoreService
import com.sap.it.api.ITApiFactory
import com.sap.it.api.keystore.KeystoreService

import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import javax.xml.parsers.DocumentBuilderFactory
import org.xml.sax.InputSource
import java.io.StringReader

import com.sap.it.op.agent.mpl.factory.impl.MessageLogFactoryImpl
import com.sap.it.api.msglog.MessageLogFactory

def messageLogFactory=new MessageLogFactoryImpl();

def converterFile2Array(textPlain,object,method){
    if (textPlain){
        def lines = textPlain.split('\n').findAll{!it.startsWith('#')}
        def headerMap = [:]    
        lines.each { line ->
            def parts = line.split('=')
            if (parts.length == 2) {
                /*def value=fixData(parts[1].trim());
                value=value.replaceAll('\\\\:', ':').replaceAll(',\\s*]', ']');
                value=value.replaceAll('version\\=','version=');*/
                def value=fixData(parts[1].trim());                
                object."$method"(parts[0].trim(),value)         
            }
        }
    }    
    return object;
}

def fixData(String input) {
    input = input.trim()    
    try {
        input=input.replaceAll('\\\\"', '"')
                          .replaceAll('\\\\:', ':')
                          .replaceAll(',}', '}')
                          .replaceAll(',\\]', ']')
                          .trim();
        def jsonSlurper = new JsonSlurper()
        def parsedJson = jsonSlurper.parseText(input.replaceAll(/(\w+)\s*:/, '"$1":'))
        return JsonOutput.prettyPrint(JsonOutput.toJson(parsedJson))
    } catch (Exception e) {}
    
    try {
        def factory = DocumentBuilderFactory.newInstance()
        def builder = factory.newDocumentBuilder()
        def xmlDoc = builder.parse(new InputSource(new StringReader(input)))
        return groovy.xml.XmlUtil.serialize(xmlDoc)
    } catch (Exception e) {}

    try {
        def lines = input.split("\n").collect { it.trim() }
        def fixedCsv = lines.join("\n")
        return fixedCsv
    } catch (Exception e) {}

    return input;
}

def String converterArray2File(array){
    def result="";
   array.each{it->
         result+= "$it.key=$it.value\n"
   }
   return result;
}

def initLocalModules(){  
    ITApiFactory.metaClass.static.getService = { Class<?> apiClass, Object context ->
        if (apiClass == KeystoreService.class) {
            return new LocalKeystoreService()
        }
        throw new RuntimeException("Invalid API request: " + apiClass)
    }
}

println "Start......."
initLocalModules();
def binding = new Binding([
    messageLogFactory: messageLogFactory
])
GroovyShell shell = new GroovyShell(binding);
//GroovyShell shell = new GroovyShell();
def groovy_script=System.getenv('groovy_script');
def sapcpi_headers=System.getenv('sapcpi_headers');
def sapcpi_properties=System.getenv('sapcpi_properties');
def sapcpi_body=System.getenv('sapcpi_body');
def method = System.getenv('sapcpi_method');
def bodyText="";
if (sapcpi_body){
    def bodyFile = new File(sapcpi_body);
    bodyText=bodyFile.exists()?bodyFile.text:"";
}
def headerText;
if (sapcpi_headers){
    def headerFile = new File(sapcpi_headers);
    headerText=headerFile.exists()?headerFile.text:"";
}
def propertiesText;
if (sapcpi_properties){
    def propertiesFile = new File(sapcpi_properties);
    propertiesText=propertiesFile.exists()?propertiesFile.text:"";
}
def script = shell.parse(new File(groovy_script));
CamelContext context = new DefaultCamelContext();                    
ExchangeBuilder builder = ExchangeBuilder.anExchange(context).withBody(bodyText);
converterFile2Array(headerText,builder,"withHeader");
converterFile2Array(propertiesText,builder,"withProperty");
Exchange exchange=builder.build();
Message  msg = new MessageImpl(exchange);
converterFile2Array(headerText,msg,"setHeader");
converterFile2Array(propertiesText,msg,"setProperty");
msg.setBody(bodyText);
script."$method"(msg);

def responseFolder = groovy_script.replace(groovy_script.split("[/\\\\]")[-1], "out")

def folder = new File(responseFolder)
if (!folder.exists())
    folder.mkdirs()    

def file = new File("$responseFolder/result.body")
file.bytes = msg.getBody()
/*
file.withWriter("UTF-8") { writer ->
    writer.write(msg.getBody());
}
*/
file = new File("$responseFolder/result.properties");
file.bytes =converterArray2File(msg.getProperties());
/*file.withWriter("UTF-8") { writer ->
    writer.write(converterArray2File(msg.getProperties()));
}
*/
file = new File("$responseFolder/result.header");
file.bytes = converterArray2File(msg.getHeaders());
/*
file.withWriter("UTF-8") { writer ->
    writer.write(converterArray2File(msg.getHeaders()));
}
*/
println ".......End"