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
    public partial class Form2 : Form
    {
        public Form2()
        {
            InitializeComponent();
        }

        private void Form2_Load(object sender, EventArgs e)
        {
            using (MySqlConnection conn = new MySqlConnection("server=localhost;uid=root;database=pcshop;port=3307;pwd=;"))
            {
                conn.Open();

                string sql = "SELECT * FROM products";
                MySqlCommand cmd = new MySqlCommand(sql, conn);

                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    listBox1.Items.Clear();

                    while (reader.Read())
                    {
                        listBox1.Items.Add(reader["pID"].ToString() + "; " + reader["nev"].ToString());
                    }
                }
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (listBox1.SelectedItem == null)
            {
                MessageBox.Show("Select an item first!");
                return;
            }

            string selected = listBox1.SelectedItem.ToString();

            MessageBox.Show(selected);


            int productId = int.Parse(selected.Split(';')[0].Trim());

            using (MySqlConnection conn = new MySqlConnection(
                "server=localhost;uid=root;database=pcshop;port=3307;pwd=;"))
            {
                conn.Open();

                string sql = "DELETE FROM products WHERE pID = @pID";
                MySqlCommand cmd = new MySqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@pID", productId);

                cmd.ExecuteNonQuery();
            }

            listBox1.Items.Remove(listBox1.SelectedItem);
        }

        private void button2_Click(object sender, EventArgs e)
        {

        }
    }
}
