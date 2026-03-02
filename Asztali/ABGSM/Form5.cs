using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI;

namespace ABGSM
{
    public partial class Form5 : Form
    {
        private readonly HttpClient client = new HttpClient();

        public Form5()
        {
            InitializeComponent();
        }

        private void Form5_Load(object sender, EventArgs e)
        {
            aaa();
        }

        public async Task aaa()
        {
            try
            {
                this.Text = "Betöltés...";
                string url = "http://localhost:3001/api/products/4";

                HttpResponseMessage response = await client.GetAsync(url);

                this.Text = response.IsSuccessStatusCode.ToString();

                if (response.IsSuccessStatusCode)
                {
                    string json = await response.Content.ReadAsStringAsync();

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    ApiResponse result = JsonSerializer.Deserialize<ApiResponse>(json, options);

                    listBox1.Items.Clear();

                    if (result != null && result.success)
                    {
                        foreach (var product in result.data)
                        {
                            listBox1.Items.Add($"ID: {product.pID}");
                            listBox1.Items.Add($"Név: {product.nev}");
                            listBox1.Items.Add($"Ár: {product.ar} Ft");
                            listBox1.Items.Add($"Leírás: {product.leiras}");
                            listBox1.Items.Add($"Készlet: {product.keszlet}");

                            listBox1.Items.Add("Attribútumok:");
                            foreach (var attr in product.attributes)
                            {
                                listBox1.Items.Add($"  {attr.Key}: {attr.Value}");
                            }

                            listBox1.Items.Add("Képek száma: " + product.images.Count);
                            listBox1.Items.Add("----------------------------");
                        }
                    }
                }
                else
                {
                    listBox1.Items.Add("Error: " + response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }
    }
}
