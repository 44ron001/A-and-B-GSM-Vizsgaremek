using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ABGSM
{
    public partial class EditProductForm : Form
    {
        private readonly HttpClient _client;
        private readonly Product _product;

        private TextBox txtNev;
        private TextBox txtLeiras;
        private NumericUpDown numAr;
        private NumericUpDown numKeszlet;
        private DataGridView gridAttr;
        private Button btnSave;
        private Button btnCancel;

        // Feltöltés
        private PictureBox picPreview;
        private Button btnChooseImage;
        private Button btnUploadImage;

        private CheckBox chkPrimary;
        private NumericUpDown numOrder;

        private string _selectedImageBase64;

        // Képlista + kezelés
        private ListView lvImages;
        private Button btnDeleteImage;
        private Button btnApplyImage;
        private Button btnUp;
        private Button btnDown;

        public EditProductForm(HttpClient client, Product product)
        {
            _client = client ?? throw new ArgumentNullException(nameof(client));
            _product = product ?? throw new ArgumentNullException(nameof(product));

            BuildUi();
            LoadDataToControls();
            _ = RefreshImagesFromServer(); // betöltés
        }

        private void BuildUi()
        {
            Text = $"Termék szerkesztése: {_product.pID}";
            StartPosition = FormStartPosition.CenterParent;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ShowInTaskbar = false;
            ClientSize = new System.Drawing.Size(820, 690);

            var padding = 12;
            int labelW = 110;
            int controlW = ClientSize.Width - (padding * 2) - labelW - 10;

            var lblNev = new Label { Text = "Név:", Left = padding, Top = padding + 4, Width = labelW };
            txtNev = new TextBox { Left = padding + labelW + 10, Top = padding, Width = controlW };

            var lblAr = new Label { Text = "Ár (Ft):", Left = padding, Top = lblNev.Bottom + 14, Width = labelW };
            numAr = new NumericUpDown
            {
                Left = padding + labelW + 10,
                Top = lblAr.Top - 4,
                Width = 160,
                Minimum = 0,
                Maximum = 1000000000,
                ThousandsSeparator = true
            };

            var lblKeszlet = new Label { Text = "Készlet:", Left = padding + labelW + 10 + 180, Top = lblAr.Top, Width = 80 };
            numKeszlet = new NumericUpDown
            {
                Left = lblKeszlet.Right + 10,
                Top = lblAr.Top - 4,
                Width = 140,
                Minimum = 0,
                Maximum = 1000000000,
                ThousandsSeparator = true
            };

            var lblLeiras = new Label { Text = "Leírás:", Left = padding, Top = lblAr.Bottom + 16, Width = labelW };
            txtLeiras = new TextBox
            {
                Left = padding + labelW + 10,
                Top = lblLeiras.Top - 4,
                Width = controlW,
                Height = 90,
                Multiline = true,
                ScrollBars = ScrollBars.Vertical
            };

            var lblAttr = new Label { Text = "Attribútumok:", Left = padding, Top = txtLeiras.Bottom + 16, Width = labelW };

            gridAttr = new DataGridView
            {
                Left = padding + labelW + 10,
                Top = lblAttr.Top - 4,
                Width = controlW,
                Height = 210,
                AllowUserToAddRows = true,
                AllowUserToDeleteRows = true,
                RowHeadersVisible = false,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect
            };
            gridAttr.Columns.Add(new DataGridViewTextBoxColumn { Name = "KeyCol", HeaderText = "Kulcs" });
            gridAttr.Columns.Add(new DataGridViewTextBoxColumn { Name = "ValCol", HeaderText = "Érték" });

            // --- KÉP FELTÖLTÉS + LISTA
            var lblImg = new Label { Text = "Képek:", Left = padding, Top = gridAttr.Bottom + 12, Width = labelW };

            btnChooseImage = new Button
            {
                Text = "Kép kiválasztása",
                Left = padding + labelW + 10,
                Top = gridAttr.Bottom + 8,
                Width = 140,
                Height = 28
            };

            btnUploadImage = new Button
            {
                Text = "Feltöltés",
                Left = btnChooseImage.Right + 10,
                Top = btnChooseImage.Top,
                Width = 100,
                Height = 28,
                Enabled = false
            };

            chkPrimary = new CheckBox
            {
                Text = "Primary",
                Left = btnUploadImage.Right + 14,
                Top = btnChooseImage.Top + 5,
                Width = 80
            };

            var lblOrder = new Label
            {
                Text = "Sorrend:",
                Left = chkPrimary.Right + 10,
                Top = btnChooseImage.Top + 6,
                Width = 60
            };

            numOrder = new NumericUpDown
            {
                Left = lblOrder.Right + 6,
                Top = btnChooseImage.Top + 2,
                Width = 70,
                Minimum = 0,
                Maximum = 1000
            };

            // előnézet
            picPreview = new PictureBox
            {
                Left = padding + labelW + 10,
                Top = btnChooseImage.Bottom + 8,
                Width = 250,
                Height = 120,
                BorderStyle = BorderStyle.FixedSingle,
                SizeMode = PictureBoxSizeMode.Zoom
            };

            // képlista
            lvImages = new ListView
            {
                Left = picPreview.Right + 12,
                Top = picPreview.Top,
                Width = ClientSize.Width - padding - (picPreview.Right + 12),
                Height = picPreview.Height,
                View = View.Details,
                FullRowSelect = true,
                GridLines = true,
                MultiSelect = false
            };
            lvImages.Columns.Add("ImageID", 70);
            lvImages.Columns.Add("Primary", 70);
            lvImages.Columns.Add("Sorrend", 70);

            btnUp = new Button { Text = "Fel", Left = lvImages.Left, Top = lvImages.Bottom + 6, Width = 60, Height = 28 };
            btnDown = new Button { Text = "Le", Left = btnUp.Right + 6, Top = btnUp.Top, Width = 60, Height = 28 };

            btnApplyImage = new Button { Text = "Kijelölt mentése", Left = btnDown.Right + 10, Top = btnUp.Top, Width = 140, Height = 28 };
            btnDeleteImage = new Button { Text = "Törlés", Left = btnApplyImage.Right + 10, Top = btnUp.Top, Width = 90, Height = 28 };

            // mentés/mégse
            btnSave = new Button { Text = "Mentés", Width = 110, Height = 32 };
            btnCancel = new Button { Text = "Mégse", Width = 110, Height = 32 };

            int btnTop = ClientSize.Height - padding - btnSave.Height;
            btnCancel.Left = ClientSize.Width - padding - btnCancel.Width;
            btnCancel.Top = btnTop;

            btnSave.Left = btnCancel.Left - 10 - btnSave.Width;
            btnSave.Top = btnTop;

            // events
            btnChooseImage.Click += BtnChooseImage_Click;
            btnUploadImage.Click += async (s, e) => await UploadImageAsync();
            btnSave.Click += async (s, e) => await SaveAsync();
            btnCancel.Click += (s, e) => { DialogResult = DialogResult.Cancel; Close(); };

            lvImages.SelectedIndexChanged += LvImages_SelectedIndexChanged;
            btnDeleteImage.Click += async (s, e) => await DeleteSelectedImageAsync();
            btnApplyImage.Click += async (s, e) => await UpdateSelectedImageAsync();
            btnUp.Click += async (s, e) => await MoveSelectedAsync(-1);
            btnDown.Click += async (s, e) => await MoveSelectedAsync(+1);

            AcceptButton = btnSave;
            CancelButton = btnCancel;

            Controls.Add(lblNev);
            Controls.Add(txtNev);
            Controls.Add(lblAr);
            Controls.Add(numAr);
            Controls.Add(lblKeszlet);
            Controls.Add(numKeszlet);
            Controls.Add(lblLeiras);
            Controls.Add(txtLeiras);
            Controls.Add(lblAttr);
            Controls.Add(gridAttr);

            Controls.Add(lblImg);
            Controls.Add(btnChooseImage);
            Controls.Add(btnUploadImage);
            Controls.Add(chkPrimary);
            Controls.Add(lblOrder);
            Controls.Add(numOrder);
            Controls.Add(picPreview);
            Controls.Add(lvImages);
            Controls.Add(btnUp);
            Controls.Add(btnDown);
            Controls.Add(btnApplyImage);
            Controls.Add(btnDeleteImage);

            Controls.Add(btnSave);
            Controls.Add(btnCancel);
        }

        private void LoadDataToControls()
        {
            txtNev.Text = _product.nev ?? "";
            txtLeiras.Text = _product.leiras ?? "";
            numAr.Value = _product.ar >= 0 ? _product.ar : 0;
            numKeszlet.Value = _product.keszlet >= 0 ? _product.keszlet : 0;

            gridAttr.Rows.Clear();
            if (_product.attributes != null)
            {
                foreach (var kv in _product.attributes)
                    gridAttr.Rows.Add(kv.Key, kv.Value);
            }
        }

        private Dictionary<string, string> ReadAttributesFromGrid()
        {
            var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (DataGridViewRow row in gridAttr.Rows)
            {
                if (row.IsNewRow) continue;
                string key = row.Cells[0].Value?.ToString()?.Trim();
                string val = row.Cells[1].Value?.ToString() ?? "";
                if (string.IsNullOrWhiteSpace(key)) continue;
                dict[key] = val;
            }
            return dict;
        }

        private async Task SaveAsync()
        {
            try
            {
                btnSave.Enabled = false;

                var req = new UpdateProductRequest
                {
                    nev = txtNev.Text.Trim(),
                    ar = (int)numAr.Value,
                    leiras = txtLeiras.Text ?? "",
                    keszlet = (int)numKeszlet.Value,
                    attributes = ReadAttributesFromGrid()
                };

                if (string.IsNullOrWhiteSpace(req.nev))
                {
                    MessageBox.Show("A név nem lehet üres!");
                    btnSave.Enabled = true;
                    return;
                }

                string url = $"http://localhost:3001/api/product/{_product.pID}";
                string json = JsonSerializer.Serialize(req);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var resp = await _client.PutAsync(url, content);

                if (!resp.IsSuccessStatusCode)
                {
                    string body = await resp.Content.ReadAsStringAsync();
                    MessageBox.Show(body);
                    btnSave.Enabled = true;
                    return;
                }

                _product.nev = req.nev;
                _product.ar = req.ar;
                _product.leiras = req.leiras;
                _product.keszlet = req.keszlet;
                _product.attributes = req.attributes;

                DialogResult = DialogResult.OK;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
                btnSave.Enabled = true;
            }
        }

        // ---------------- IMAGES ----------------

        private void BtnChooseImage_Click(object sender, EventArgs e)
        {
            using (var ofd = new OpenFileDialog())
            {
                ofd.Filter = "Képek|*.jpg;*.jpeg;*.png;*.webp;*.bmp";
                if (ofd.ShowDialog() != DialogResult.OK) return;

                picPreview.ImageLocation = ofd.FileName;

                byte[] bytes = File.ReadAllBytes(ofd.FileName);
                _selectedImageBase64 = Convert.ToBase64String(bytes);
                btnUploadImage.Enabled = true;
            }
        }

        private async Task UploadImageAsync()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_selectedImageBase64))
                {
                    MessageBox.Show("Nincs kiválasztott kép!");
                    return;
                }

                btnUploadImage.Enabled = false;
                btnChooseImage.Enabled = false;

                var payload = new UploadImageRequest
                {
                    Data = _selectedImageBase64,
                    IsPrimary = chkPrimary.Checked,
                    Order = (int)numOrder.Value
                };

                string url = $"http://localhost:3001/api/product/{_product.pID}/image";
                string json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var resp = await _client.PostAsync(url, content);

                string body = await resp.Content.ReadAsStringAsync();

                if (!resp.IsSuccessStatusCode)
                {
                    MessageBox.Show($"Hiba: {(int)resp.StatusCode} {resp.ReasonPhrase}\n\n{body}");
                    btnUploadImage.Enabled = true;
                    btnChooseImage.Enabled = true;
                    return;
                }

                _selectedImageBase64 = null;
                btnChooseImage.Enabled = true;
                btnUploadImage.Enabled = false;

                await RefreshImagesFromServer();
                MessageBox.Show("Kép feltöltve!");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Kliens hiba: " + ex.Message);
                btnChooseImage.Enabled = true;
                btnUploadImage.Enabled = true;
            }
        }

        private async Task RefreshImagesFromServer()
        {
            try
            {
                string url = $"http://localhost:3001/api/product/{_product.pID}";
                var resp = await _client.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return;

                var json = await resp.Content.ReadAsStringAsync();
                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<SingleProductResponse>(json, opts);

                if (result?.success == true && result.data != null)
                {
                    _product.images = result.data.images ?? new List<ProductImage>();
                    LoadImagesToList();
                }
            }
            catch { /* elég, ha nem crashel */ }
        }

        private void LoadImagesToList()
        {
            lvImages.Items.Clear();

            if (_product.images == null) _product.images = new List<ProductImage>();

            foreach (var img in _product.images)
            {
                var it = new ListViewItem(img.id.ToString());
                it.SubItems.Add(img.isPrimary ? "Igen" : "Nem");
                it.SubItems.Add(img.order.ToString());
                it.Tag = img;
                lvImages.Items.Add(it);
            }
        }

        private void LvImages_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvImages.SelectedItems.Count == 0) return;

            var img = (ProductImage)lvImages.SelectedItems[0].Tag;

            // állítsuk be a szerkesztő mezőket is
            chkPrimary.Checked = img.isPrimary;
            numOrder.Value = img.order;

            // preview base64-ből
            try
            {
                picPreview.Image = Base64ToImage(img.data);
            }
            catch
            {
                // ha valamiért nem jó a base64, ne haljon meg
                picPreview.Image = null;
            }
        }

        private async Task DeleteSelectedImageAsync()
        {
            if (lvImages.SelectedItems.Count == 0)
            {
                MessageBox.Show("Válassz ki egy képet a listából!");
                return;
            }

            var img = (ProductImage)lvImages.SelectedItems[0].Tag;

            var dr = MessageBox.Show($"Biztos törlöd? (ImageID: {img.id})", "Törlés", MessageBoxButtons.YesNo);
            if (dr != DialogResult.Yes) return;

            string url = $"http://localhost:3001/api/product/{_product.pID}/image/{img.id}";
            var resp = await _client.DeleteAsync(url);
            var body = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                MessageBox.Show($"Hiba: {(int)resp.StatusCode}\n{body}");
                return;
            }

            await RefreshImagesFromServer();
        }

        private async Task UpdateSelectedImageAsync()
        {
            if (lvImages.SelectedItems.Count == 0)
            {
                MessageBox.Show("Válassz ki egy képet a listából!");
                return;
            }

            var img = (ProductImage)lvImages.SelectedItems[0].Tag;

            var payload = new UpdateImageRequest
            {
                IsPrimary = chkPrimary.Checked,
                Order = (int)numOrder.Value
            };

            string url = $"http://localhost:3001/api/product/{_product.pID}/image/{img.id}";
            string json = JsonSerializer.Serialize(payload);
            var resp = await _client.PutAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
            var body = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                MessageBox.Show($"Hiba: {(int)resp.StatusCode}\n{body}");
                return;
            }

            await RefreshImagesFromServer();
        }

        private async Task MoveSelectedAsync(int delta)
        {
            if (lvImages.SelectedItems.Count == 0) return;

            var img = (ProductImage)lvImages.SelectedItems[0].Tag;
            int newOrder = img.order + delta;
            if (newOrder < 0) newOrder = 0;

            // csak order-t update-eljük
            var payload = new UpdateImageRequest
            {
                IsPrimary = img.isPrimary,
                Order = newOrder
            };

            string url = $"http://localhost:3001/api/product/{_product.pID}/image/{img.id}";
            string json = JsonSerializer.Serialize(payload);
            var resp = await _client.PutAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
            var body = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                MessageBox.Show($"Hiba: {(int)resp.StatusCode}\n{body}");
                return;
            }

            await RefreshImagesFromServer();

            // próbáljuk visszajelölni
            foreach (ListViewItem it in lvImages.Items)
            {
                if (it.Text == img.id.ToString())
                {
                    it.Selected = true;
                    it.Focused = true;
                    it.EnsureVisible();
                    break;
                }
            }
        }

        private static Image Base64ToImage(string base64)
        {
            if (string.IsNullOrWhiteSpace(base64)) return null;

            // ha véletlen data:image/... lenne
            int comma = base64.IndexOf(',');
            if (comma != -1) base64 = base64.Substring(comma + 1);

            byte[] bytes = Convert.FromBase64String(base64);
            using (var ms = new MemoryStream(bytes))
            {
                return Image.FromStream(ms);
            }
        }

        // ---------------- DTO-k ----------------

        private class UploadImageRequest
        {
            [JsonPropertyName("data")]
            public string Data { get; set; }

            [JsonPropertyName("isPrimary")]
            public bool IsPrimary { get; set; }

            [JsonPropertyName("order")]
            public int Order { get; set; }
        }

        private class UpdateImageRequest
        {
            [JsonPropertyName("isPrimary")]
            public bool IsPrimary { get; set; }

            [JsonPropertyName("order")]
            public int Order { get; set; }
        }

        private class SingleProductResponse
        {
            public bool success { get; set; }
            public Product data { get; set; }
        }
    }

    public class UpdateProductRequest
    {
        public string nev { get; set; }
        public int ar { get; set; }
        public string leiras { get; set; }
        public int keszlet { get; set; }
        public Dictionary<string, string> attributes { get; set; }
    }
}