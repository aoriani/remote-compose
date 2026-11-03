package demo.remotecompose;
import org.junit.Test;import static org.junit.Assert.*;
public class HashesTest {@Test public void hashesWireBytes()throws Exception{assertEquals("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",Hashes.sha256(new byte[0]));}}
