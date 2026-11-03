package demo.pipeline

import androidx.compose.remote.core.RcPlatformServices
import androidx.compose.remote.creation.RemoteComposeWriter
import androidx.compose.remote.creation.json.RemoteComposeJsonParser
import org.json.JSONObject
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

/** External named resource catalog, not a new JSON component or a client widget. */
object JvmAssets {
    private val platform = object : RcPlatformServices by RemoteComposeJsonParser.DEFAULT_PLATFORM {
        override fun imageToByteArray(image: Any): ByteArray = ByteArrayOutputStream().use {
            check(ImageIO.write(image as BufferedImage, "png", it)); it.toByteArray()
        }
        override fun getImageWidth(image: Any) = (image as BufferedImage).width
        override fun getImageHeight(image: Any) = (image as BufferedImage).height
        override fun isAlpha8Image(image: Any) = false
    }
    private val images: Map<String, BufferedImage> by lazy {
        val loader = JvmAssets::class.java
        val manifest = loader.getResourceAsStream("/assets/catalog.json")!!.bufferedReader().use { JSONObject(it.readText()) }
        manifest.keySet().associateWith { name -> loader.getResourceAsStream("/assets/${manifest.getString(name)}")!!.use { ImageIO.read(it) } }
    }
    fun encode(source: String): ByteArray {
        val tags = RemoteComposeJsonParser.parseHeaderOnly(source).sortedBy { it.tag }.toTypedArray()
        val writer = RemoteComposeWriter(platform,RemoteComposeJsonParser.parseApiLevel(source),*tags)
        val parser = RemoteComposeJsonParser(writer)
        images.forEach { (name,image) -> parser.defineBitmap(name,image) }
        parser.parse(source)
        return writer.encodeToByteArray()
    }
}
