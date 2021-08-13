package sailpoint.plugin.csvimporter.rest;

import java.util.*;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import sailpoint.rest.plugin.BasePluginResource;
import sailpoint.rest.plugin.RequiredRight;

@RequiredRight(value = "csvImporterRESTAllow")
@Path("csvImporter")
public class CsvImporterResource extends BasePluginResource {
	public static final Log log = LogFactory.getLog(CsvImporterResource.class);

	@POST
	@Path("bulkBundleUpdate")
	@Produces(MediaType.APPLICATION_JSON)
	@RequiredRight(value = "bulkBundleUpdate")
	public Map postBulkBundleUpdate() {
		log.debug("POST bulkBundleUpdate");
		Map ret = null;
		return ret;
	}

	@Override
	public String getPluginName() {
		return "csvimporter";
	}
}
