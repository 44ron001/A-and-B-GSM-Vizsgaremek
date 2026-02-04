using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using MySql.Data.MySqlClient;

namespace ABGSM
{
    public partial class Form4 : Form
    {
        public Form4()
        {
            InitializeComponent();
        }

        private void Form4_Load(object sender, EventArgs e)
        {
            using (MySqlConnection conn = new MySqlConnection("server=localhost;uid=root;database=pcshop;port=3307;pwd=;"))
            {
                conn.Open();

                string sql = "SELECT users.nev AS nev, products.nev AS nev2, orders.datum AS date, orders.allapot AS detail FROM `orders` " +
                    "\r\nINNER JOIN users ON users.userID = orders.userID \r\nINNER JOIN order_items ON order_items.orderID = orders.orderID" +
                    "\r\nINNER JOIN products ON products.pID = order_items.pID";
                MySqlCommand cmd = new MySqlCommand(sql, conn);

                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    listBox1.Items.Clear();

                    while (reader.Read())
                    {
                        listBox1.Items.Add(reader["nev"].ToString() + " ; " + reader["nev2"].ToString() + " ; " + reader["date"].ToString() + " ; " + reader["detail"].ToString());
                    }
                }
            }
        }

        private void listBox1_SelectedIndexChanged(object sender, EventArgs e)
        {

        }
    }
}
