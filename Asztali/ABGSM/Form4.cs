using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using static System.Windows.Forms.VisualStyles.VisualStyleElement;

namespace ABGSM
{
    public partial class Form4 : Form
    {
        private readonly HttpClient client = new HttpClient();

        // TODO: ide írd be a PSU kategória ID-ját a categories táblából
        private const int PSU_CATEGORY_ID = 3;

        public Form4()
        {
            InitializeComponent();

            listView1.View = View.Details;
            listView1.FullRowSelect = true;
            listView1.GridLines = true;
            listView1.MultiSelect = false;

            listView1.Columns.Clear();
            listView1.Columns.Add("ID", 50);
            listView1.Columns.Add("Név", 220);
            listView1.Columns.Add("Ár (Ft)", 100);
            listView1.Columns.Add("Készlet", 80);

            listView1.DoubleClick += listView1_DoubleClick;
            this.Load += Form4_Load;
        }

        private async void Form4_Load(object sender, EventArgs e)
        {
            await LoadProducts();
        }

        private async Task LoadProducts()
        {
            try
            {
                this.Text = "Betöltés...";
                string url = "http://localhost:3001/api/products/5";

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
                        item.SubItems.Add(product.nev ?? "");
                        item.SubItems.Add(product.ar.ToString());
                        item.SubItems.Add(product.keszlet.ToString());
                        item.Tag = product;

                        listView1.Items.Add(item);
                    }
                }

                this.Text = "Power Supply Unit";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }

        private async void listView1_DoubleClick(object sender, EventArgs e)
        {
            if (listView1.SelectedItems.Count == 0) return;

            var product = (Product)listView1.SelectedItems[0].Tag;

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
}