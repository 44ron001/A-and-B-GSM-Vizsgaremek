using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ABGSM
{
    public partial class Form2 : Form
    {
        private readonly HttpClient client = new HttpClient();

        public Form2()
        {
            InitializeComponent();
            this.Load += Form2_Load;
        }

        private async void Form2_Load(object sender, EventArgs e)
        {
            await aaa();
        }

        public async Task aaa()
        {
            try
            {
                this.Text = "Betöltés...";
                string url = "http://localhost:3001/api/products/1";

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

                            listBox1.Items.Add("Képek száma: "+ product.images.Count);
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

        private void button1_Click(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {

        }
    }

    // ===== MODEL OSZTÁLYOK =====

    public class ApiResponse
    {
        public bool success { get; set; }
        public List<Product> data { get; set; }
    }

    public class Product
    {
        public int pID { get; set; }
        public string nev { get; set; }
        public int ar { get; set; }
        public string leiras { get; set; }
        public int keszlet { get; set; }
        public Dictionary<string, string> attributes { get; set; }
        public List<ProductImage> images { get; set; }
    }

    public class ProductImage
    {
        public int id { get; set; }
        public string data { get; set; }
        public bool isPrimary { get; set; }
        public int order { get; set; }
    }
}
