using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net.Http;
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
            this.Load += Form2_Load;
        }

        private void Form2_Load(object sender, EventArgs e)
        {
            aaa();
        }

        public void aaa()
        {
            this.Text = "fasz+";
            HttpClient client = new HttpClient();
            string url = "http://localhost:3001/api/products/2";

            HttpResponseMessage response = client.GetAsync(url).Result;
            this.Text = response.IsSuccessStatusCode.ToString();
            if (response.IsSuccessStatusCode)
            {
                string json = response.Content.ReadAsStringAsync().Result;
                //Clipboard.SetText(responseData);
                listBox1.Items.Clear();
                //listBox1.Items.Add(responseData);
                //DESZERIALIZÁLÁS
            }
            else
            {
                listBox1.Items.Add("Error: " + response.StatusCode);
            }
        }


        private void button1_Click(object sender, EventArgs e)
        {
            
        }

        private void button2_Click(object sender, EventArgs e)
        {

        }
    }
}
