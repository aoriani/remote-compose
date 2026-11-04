package demo.pipeline

import androidx.compose.remote.core.RemotePathBase
import androidx.compose.remote.core.RcPlatformServices
import androidx.compose.remote.creation.RemoteComposeWriter
import androidx.compose.remote.creation.json.RemoteComposeJsonParser
import org.json.JSONObject
import java.awt.image.BufferedImage
import java.awt.RenderingHints
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

/** External named resource catalog, not a new JSON component or a client widget. */
object JvmAssets {
    private val platform = object : RcPlatformServices by RemoteComposeJsonParser.DEFAULT_PLATFORM {
        override fun pathToFloatArray(path: Any): FloatArray = if (path is RemotePathBase) path.path.copyOf(path.size) else floatArrayOf()
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
        manifest.keySet().associateWith { name -> loader.getResourceAsStream("/assets/${manifest.getString(name)}")!!.use { stream ->
            val original = ImageIO.read(stream)
            if (maxOf(original.width,original.height) <= 640) original else {
                val ratio = 640.0 / maxOf(original.width,original.height)
                BufferedImage((original.width*ratio).toInt(),(original.height*ratio).toInt(),BufferedImage.TYPE_INT_ARGB).also { resized ->
                    val g=resized.createGraphics();g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BICUBIC)
                    g.drawImage(original,0,0,resized.width,resized.height,null);g.dispose()
                }
            }
        } }
    }
    fun contains(name: String) = images.containsKey(name)
    fun encode(source: String): ByteArray {
        val tags = RemoteComposeJsonParser.parseHeaderOnly(source).sortedBy { it.tag }.toTypedArray()
        val writer = RemoteComposeWriter(platform,RemoteComposeJsonParser.parseApiLevel(source),*tags)
        val parser = RemoteComposeJsonParser(writer)
        images.forEach { (name,image) -> parser.defineBitmap(name,image) }
        parser.parse(source)
        return writer.encodeToByteArray()
    }
}
