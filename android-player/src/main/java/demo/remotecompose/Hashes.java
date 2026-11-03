package demo.remotecompose;
import java.security.MessageDigest;
public final class Hashes { private Hashes(){} public static String sha256(byte[] bytes)throws Exception{StringBuilder out=new StringBuilder();for(byte b:MessageDigest.getInstance("SHA-256").digest(bytes))out.append(String.format("%02x",b));return out.toString();} }
