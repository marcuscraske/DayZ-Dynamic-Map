using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using UberLib.Connector;
using UberLib.Connector.Connectors;
using System.Configuration;
using System.Text;
using System.Text.RegularExpressions;

public partial class _Default : System.Web.UI.Page 
{
    protected void Page_Load(object sender, EventArgs e)
    {
        // Create connector
        MySQL conn = new MySQL();
        conn.Settings_Host = ConfigurationManager.AppSettings["host"];
        conn.Settings_Port = int.Parse(ConfigurationManager.AppSettings["port"]);
        conn.Settings_Database = ConfigurationManager.AppSettings["database"];
        conn.Settings_User = ConfigurationManager.AppSettings["user"];
        conn.Settings_Pass = ConfigurationManager.AppSettings["pass"];
        conn.Connect();
        // Retrieve the active players
        Result activeVehicles = conn.Query_Read("SELECT otype, pos FROM objects");
        // Write the XML feed
        Response.ContentType = "application/xml";
        StringBuilder output = new StringBuilder();

        output.Append("<d>");

        Match pos;
        foreach (ResultRow vehicle in activeVehicles)
        {
            if (vehicle["pos"].Length > 0 && (pos = Regex.Match(vehicle["pos"], @"\[(.+)\,\[(.+)\,(.+)\,(.+)]]")).Groups.Count >= 3)
            {
                output.Append("    <v>\r\n");
                output.Append("         <title>").Append(HttpUtility.HtmlEncode(vehicle["otype"])).Append("</title>\r\n");
                output.Append("         <x>").Append(pos.Groups[2].Value.Trim()).Append("</x>\r\n");
                output.Append("         <y>").Append(pos.Groups[3].Value.Trim()).Append("</y>\r\n");
                output.Append("    </v>\r\n");
            }
        }
        output.Append("</d>");

        Response.Write(output.ToString());
    }
}