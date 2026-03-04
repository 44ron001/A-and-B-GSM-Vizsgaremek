using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
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

            listView1.View = View.Details;
            listView1.FullRowSelect = true;
            listView1.GridLines = true;
            listView1.MultiSelect = false;

            listView1.Columns.Add("ID", 50);
            listView1.Columns.Add("Név", 180);
            listView1.Columns.Add("Ár (Ft)", 100);
            listView1.Columns.Add("Készlet", 80);

            listView1.DoubleClick += listView1_DoubleClick;

            this.Load += Form2_Load;
        }

        private async void Form2_Load(object sender, EventArgs e)
        {
            await LoadProducts();
        }

        private async Task LoadProducts()
        {
            try
            {
                this.Text = "Betöltés...";
                string url = "http://localhost:3001/api/products/1";

                HttpResponseMessage response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Hiba: " + response.StatusCode);
                    return;
                }

                string json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                ApiResponse result = JsonSerializer.Deserialize<ApiResponse>(json, options);

                listView1.Items.Clear();

                if (result != null && result.success && result.data != null)
                {
                    foreach (var product in result.data)
                    {
                        var item = new ListViewItem(product.pID.ToString());
                        item.SubItems.Add(product.nev);
                        item.SubItems.Add(product.ar.ToString());
                        item.SubItems.Add(product.keszlet.ToString());
                        item.Tag = product;
                        listView1.Items.Add(item);
                    }
                }

                this.Text = "Kész";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }

        private async void listView1_DoubleClick(object sender, EventArgs e)
        {
            if (listView1.SelectedItems.Count == 0) return;

            var selected = listView1.SelectedItems[0];
            var product = (Product)selected.Tag;

            using (var edit = new EditProductForm(client, product))
            {
                var dr = edit.ShowDialog();
                if (dr == DialogResult.OK)
                {
                    await LoadProducts();
                }
            }
        }
    }

    public class ApiResponse
    {
        public bool success { get; set; }
        public List<Product> data { get; set; }
    }

    public class ProductImage
    {
        public int id { get; set; }
        public string data { get; set; }
        public bool isPrimary { get; set; }
        public int order { get; set; }
    }
}