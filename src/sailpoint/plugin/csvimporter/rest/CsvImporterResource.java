package sailpoint.plugin.csvimporter.rest;

import java.util.*;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.StreamingOutput;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import sailpoint.api.SailPointContext;
import sailpoint.api.SailPointFactory;
import sailpoint.object.Bundle;
import sailpoint.rest.plugin.BasePluginResource;
import sailpoint.rest.plugin.RequiredRight;
import sailpoint.tools.GeneralException;

@RequiredRight(value = "csvImporterRESTAllow")
@Path("csvimporter")
public class CsvImporterResource extends BasePluginResource {
	public static final Log log = LogFactory.getLog(CsvImporterResource.class);
	private static final String DISABLE_ACTION="Disable";
	private static final String ENABLE_ACTION="Enable";

	@POST
	@Path("bulkBundleUpdate")
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@RequiredRight(value = "bulkBundleUpdate")
	public List postBulkBundleUpdate(List<Map<String,String>> roleList) throws GeneralException {
		log.debug("POST bulkBundleUpdate");
		System.out.println("Got the roles as :"+roleList);
			SailPointContext context= SailPointFactory.getCurrentContext();
			if(null!=roleList&&!roleList.isEmpty()) {
				String result = "Failed";
				for (Map<String, String> recordMap : roleList) {
					System.out.println("Record :"+recordMap);
					String bundleName =  recordMap.get("RoleName");
					String action = recordMap.get("Action");
					System.out.println("Iterating for the bundle:" + bundleName);
					Bundle bundle = context.getObjectByName(Bundle.class, bundleName);
					System.out.println("Bundle object:" + bundle);
					if (null != bundle) {
						boolean isDisabled = bundle.isDisabled();
						System.out.println("Disabled:"+isDisabled+", current action:"+action);
						if ( null != action &&((isDisabled && action.equalsIgnoreCase(DISABLE_ACTION))||(!isDisabled&&action.equalsIgnoreCase(ENABLE_ACTION)))) {
							result = "Already Modified";
						} else if (null != action) {
							System.out.println("Performing action:"+action);
							try {
								if (action.equalsIgnoreCase(ENABLE_ACTION)) {
									bundle.setDisabled(false);
								} else if (action.equalsIgnoreCase(DISABLE_ACTION)) {
									bundle.setDisabled(true);
								}
								context.saveObject(bundle);
								context.commitTransaction();
								result = "Success";
							} catch (Exception e) {
								System.out.println("Error occurred in bundle modification:" + e);
								result = "Modification Failed";
							}
						}
					} else {
						System.out.println("Bundle is null:" + bundleName);
						result = "No Matching Role found";
					}
					((Map) recordMap).put("Result", result);

				}
			}
			System.out.println("Returning:"+roleList);
		return roleList;
	}

	@Override
	public String getPluginName() {
		return "csvimporter";
	}
}
