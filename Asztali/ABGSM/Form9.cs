using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ABGSM
{
    public partial class Form9 : Form
    {
        private const int CATEGORY_ID = 3;
        private readonly HttpClient client = new HttpClient();

        private ListView listView1;
        private Button btnRefresh;
        private Label lblTitle;

        public Form9()
        {
            BuildUi();
            Load += Form9_Load;
        }

        private void BuildUi()
        {
            Text = "PC Cases";
            StartPosition = FormStartPosition.CenterScreen;
            Width = 760;
            Height = 520;
            MinimumSize = new System.Drawing.Size(760, 520);

            lblTitle = new Label
            {
                Text = "PC CASES",
                AutoSize = true,
                Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold),
                Left = 12,
                Top = 12
            };

            btnRefresh = new Button
            {
                Text = "Frissítés",
                Width = 100,
                Height = 30,
                Left = 620,
                Top = 12
            };
            btnRefresh.Click += async (s, e) => await LoadProducts();

            listView1 = new ListView
            {
                Left = 12,
                Top = 55,
                Width = 710,
                Height = 400,
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right,
                View = View.Details,
                FullRowSelect = true,
                GridLines = true,
                MultiSelect = false
            };

            listView1.Columns.Add("ID", 60);
            listView1.Columns.Add("Név", 280);
            listView1.Columns.Add("Ár (Ft)", 120);
            listView1.Columns.Add("Készlet", 100);

            listView1.DoubleClick += listView1_DoubleClick;

            Controls.Add(lblTitle);
            Controls.Add(btnRefresh);
            Controls.Add(listView1);
        }

        private async void Form9_Load(object sender, EventArgs e)
        {
            await LoadProducts();
        }

        private async Task LoadProducts()
        {
            try
            {
                Text = "PC Cases - Betöltés...";
                btnRefresh.Enabled = false;

                string url = $"http://localhost:3001/api/products/{CATEGORY_ID}";
                HttpResponseMessage response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Hiba: " + response.StatusCode);
                    return;
                }

                string json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

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

                Text = "PC Cases";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
                Text = "PC Cases";
            }
            finally
            {
                btnRefresh.Enabled = true;
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
}