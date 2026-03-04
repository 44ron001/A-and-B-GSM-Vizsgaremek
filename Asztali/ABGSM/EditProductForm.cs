using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
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

        private PictureBox picPreview;
        private Button btnChooseImage;
        private Button btnUploadImage;
        private CheckBox chkPrimary;
        private NumericUpDown numOrder;

        private string _selectedImageBase64;

        public EditProductForm(HttpClient client, Product product)
        {
            _client = client ?? throw new ArgumentNullException(nameof(client));
            _product = product ?? throw new ArgumentNullException(nameof(product));

            BuildUi();
            LoadDataToControls();
        }

        private void BuildUi()
        {
            Text = $"Termék szerkesztése: {_product.pID}";
            StartPosition = FormStartPosition.CenterParent;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ShowInTaskbar = false;
            ClientSize = new System.Drawing.Size(760, 650);

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

            var lblImg = new Label { Text = "Kép:", Left = padding, Top = gridAttr.Bottom + 12, Width = labelW };

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

            picPreview = new PictureBox
            {
                Left = padding + labelW + 10,
                Top = btnChooseImage.Bottom + 8,
                Width = 220,
                Height = 90,
                BorderStyle = BorderStyle.FixedSingle,
                SizeMode = PictureBoxSizeMode.Zoom
            };

            btnSave = new Button { Text = "Mentés", Width = 110, Height = 32 };
            btnCancel = new Button { Text = "Mégse", Width = 110, Height = 32 };

            int btnTop = ClientSize.Height - padding - btnSave.Height;
            btnCancel.Left = ClientSize.Width - padding - btnCancel.Width;
            btnCancel.Top = btnTop;

            btnSave.Left = btnCancel.Left - 10 - btnSave.Width;
            btnSave.Top = btnTop;

            btnChooseImage.Click += BtnChooseImage_Click;
            btnUploadImage.Click += async (s, e) => await UploadImageAsync();
            btnSave.Click += async (s, e) => await SaveAsync();
            btnCancel.Click += (s, e) => { DialogResult = DialogResult.Cancel; Close(); };

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

        private void BtnChooseImage_Click(object sender, EventArgs e)
        {
            using (var ofd = new OpenFileDialog())
            {
                ofd.Filter = "Képek|*.jpg;*.jpeg;*.png;*.webp;*.bmp";
                if (ofd.ShowDialog() != DialogResult.OK) return;

                picPreview.ImageLocation = ofd.FileName;
                byte[] bytes = System.IO.File.ReadAllBytes(ofd.FileName);
                _selectedImageBase64 = Convert.ToBase64String(bytes);
                btnUploadImage.Enabled = true;
            }
        }

        private async Task UploadImageAsync()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_selectedImageBase64)) return;

                btnUploadImage.Enabled = false;
                btnChooseImage.Enabled = false;

                var payload = new UploadImageRequest
                {
                    data = _selectedImageBase64,
                    isPrimary = chkPrimary.Checked,
                    order = (int)numOrder.Value
                };

                string url = $"http://localhost:3001/api/product/{_product.pID}/image";
                string json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var resp = await _client.PostAsync(url, content);

                if (!resp.IsSuccessStatusCode)
                {
                    btnUploadImage.Enabled = true;
                    btnChooseImage.Enabled = true;
                    return;
                }

                _selectedImageBase64 = null;
                btnChooseImage.Enabled = true;
                btnUploadImage.Enabled = false;
                MessageBox.Show("Kép feltöltve");
            }
            catch
            {
                btnChooseImage.Enabled = true;
                btnUploadImage.Enabled = true;
            }
        }

        private class UploadImageRequest
        {
            public string data { get; set; }
            public bool isPrimary { get; set; }
            public int order { get; set; }
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