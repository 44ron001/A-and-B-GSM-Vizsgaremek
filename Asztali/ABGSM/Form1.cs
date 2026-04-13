using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Net.Http;
using System.Text;
using System.Windows.Forms;
using Newtonsoft.Json;

namespace ABGSM
{
    public partial class Form1 : Form
    {
        public bool isLoggedIn = false;
        public string jwtToken = null;

        private Button btnShowPassword;
        private bool isPasswordVisible = false;
        private bool isAdmin = false;

        private ToolStripMenuItem usersToolStripMenuItem;
        private ToolStripMenuItem pcCasesMenuItem;
        private ToolStripMenuItem monitorsToolStripMenuItem;
        private ToolStripMenuItem motherboardsToolStripMenuItem;
        private ToolStripMenuItem coolerToolStripMenuItem;

        private Font titleFont = new Font("Segoe UI", 18, FontStyle.Bold);
        private Font labelFont = new Font("Segoe UI", 10, FontStyle.Regular);
        private Font inputFont = new Font("Segoe UI", 11, FontStyle.Regular);
        private Font buttonFont = new Font("Segoe UI", 10, FontStyle.Bold);
        private Font infoFont = new Font("Consolas", 11, FontStyle.Regular);

        public Form1()
        {
            InitializeComponent();
            DoubleBuffered = true;
            Paint += Form1_Paint;
            Load += Form1_Load;

            CreateShowPasswordButton();
            SetupPasswordTextbox();
            CreateUsersMenuItem();
            CreateMissingCategoryMenuItems();
            ApplyModernStyle();

            this.Shown += (s, e) => UpdateShowPasswordButtonPosition();

            if (loginToolStripMenuItem != null)
            {
                loginToolStripMenuItem.Click -= loginToolStripMenuItem_Click;
                loginToolStripMenuItem.Click += loginToolStripMenuItem_Click;
            }

            if (exitToolStripMenuItem1 != null)
            {
                exitToolStripMenuItem1.Click -= exitToolStripMenuItem1_Click;
                exitToolStripMenuItem1.Click += exitToolStripMenuItem1_Click;
            }

            if (button1 != null)
            {
                button1.Click -= button1_Click_1;
                button1.Click += button1_Click_1;
            }

            if (cPUToolStripMenuItem != null)
            {
                cPUToolStripMenuItem.Click -= cPUToolStripMenuItem_Click;
                cPUToolStripMenuItem.Click += cPUToolStripMenuItem_Click;
            }

            if (gPUToolStripMenuItem != null)
            {
                gPUToolStripMenuItem.Click -= gPUToolStripMenuItem_Click;
                gPUToolStripMenuItem.Click += gPUToolStripMenuItem_Click;
            }

            if (pCCasesToolStripMenuItem != null)
            {
                pCCasesToolStripMenuItem.Click -= pCCasesToolStripMenuItem_Click;
                pCCasesToolStripMenuItem.Click += pCCasesToolStripMenuItem_Click;
            }

            if (ramToolStripMenuItem != null)
            {
                ramToolStripMenuItem.Click -= ramToolStripMenuItem_Click;
                ramToolStripMenuItem.Click += ramToolStripMenuItem_Click;
            }

            if (usersToolStripMenuItem != null)
            {
                usersToolStripMenuItem.Click -= usersToolStripMenuItem_Click;
                usersToolStripMenuItem.Click += usersToolStripMenuItem_Click;
            }

            if (pcCasesMenuItem != null)
            {
                pcCasesMenuItem.Click -= pcCasesMenuItem_Click;
                pcCasesMenuItem.Click += pcCasesMenuItem_Click;
            }

            if (monitorsToolStripMenuItem != null)
            {
                monitorsToolStripMenuItem.Click -= monitorsToolStripMenuItem_Click;
                monitorsToolStripMenuItem.Click += monitorsToolStripMenuItem_Click;
            }

            if (motherboardsToolStripMenuItem != null)
            {
                motherboardsToolStripMenuItem.Click -= motherboardsToolStripMenuItem_Click;
                motherboardsToolStripMenuItem.Click += motherboardsToolStripMenuItem_Click;
            }

            if (coolerToolStripMenuItem != null)
            {
                coolerToolStripMenuItem.Click -= coolerToolStripMenuItem_Click;
                coolerToolStripMenuItem.Click += coolerToolStripMenuItem_Click;
            }
        }

        private void ApplyModernStyle()
        {
            BackColor = Color.FromArgb(236, 240, 245);
            ForeColor = Color.FromArgb(35, 35, 35);
            Font = labelFont;
            MinimumSize = new Size(900, 600);

            if (menuStrip1 != null)
            {
                menuStrip1.BackColor = Color.FromArgb(36, 41, 46);
                menuStrip1.ForeColor = Color.White;
                menuStrip1.Font = new Font("Segoe UI", 10, FontStyle.Regular);
                menuStrip1.Renderer = new ToolStripProfessionalRenderer(new DarkMenuColorTable());
            }

            if (label2 != null)
            {
                label2.Font = titleFont;
                label2.ForeColor = Color.FromArgb(36, 41, 46);
                label2.BackColor = Color.Transparent;
            }

            if (label3 != null)
            {
                label3.Font = labelFont;
                label3.ForeColor = Color.FromArgb(55, 55, 55);
                label3.BackColor = Color.Transparent;
            }

            if (label4 != null)
            {
                label4.Font = labelFont;
                label4.ForeColor = Color.FromArgb(55, 55, 55);
                label4.BackColor = Color.Transparent;
            }

            if (label5 != null)
            {
                label5.Font = infoFont;
                label5.ForeColor = Color.FromArgb(30, 30, 30);
                label5.BackColor = Color.FromArgb(255, 255, 255);
                label5.BorderStyle = BorderStyle.FixedSingle;
                label5.AutoSize = false;
                label5.TextAlign = ContentAlignment.TopLeft;
                label5.Padding = new Padding(12);
            }

            StyleTextBox(textBox1);
            StyleTextBox(textBox2);
            StyleMainButton(button1);
        }

        private void StyleTextBox(TextBox tb)
        {
            if (tb == null) return;

            tb.BorderStyle = BorderStyle.FixedSingle;
            tb.Font = inputFont;
            tb.BackColor = Color.White;
            tb.ForeColor = Color.FromArgb(35, 35, 35);
        }

        private void StyleMainButton(Button btn)
        {
            if (btn == null) return;

            btn.FlatStyle = FlatStyle.Flat;
            btn.FlatAppearance.BorderSize = 0;
            btn.BackColor = Color.FromArgb(52, 120, 246);
            btn.ForeColor = Color.White;
            btn.Font = buttonFont;
            btn.Cursor = Cursors.Hand;

            btn.MouseEnter -= MainButton_MouseEnter;
            btn.MouseLeave -= MainButton_MouseLeave;
            btn.MouseEnter += MainButton_MouseEnter;
            btn.MouseLeave += MainButton_MouseLeave;
        }

        private void MainButton_MouseEnter(object sender, EventArgs e)
        {
            if (sender is Button btn)
                btn.BackColor = Color.FromArgb(37, 99, 235);
        }

        private void MainButton_MouseLeave(object sender, EventArgs e)
        {
            if (sender is Button btn)
                btn.BackColor = Color.FromArgb(52, 120, 246);
        }

        private void CreateShowPasswordButton()
        {
            if (textBox2 == null) return;

            btnShowPassword = new Button();
            btnShowPassword.Name = "btnShowPassword";
            btnShowPassword.Text = "Show";
            btnShowPassword.Width = 64;
            btnShowPassword.Height = textBox2.Height;
            btnShowPassword.Click += BtnShowPassword_Click;
            btnShowPassword.FlatStyle = FlatStyle.Flat;
            btnShowPassword.FlatAppearance.BorderSize = 0;
            btnShowPassword.BackColor = Color.FromArgb(230, 235, 245);
            btnShowPassword.ForeColor = Color.FromArgb(35, 35, 35);
            btnShowPassword.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            btnShowPassword.Cursor = Cursors.Hand;

            btnShowPassword.MouseEnter += (s, e) => btnShowPassword.BackColor = Color.FromArgb(210, 220, 238);
            btnShowPassword.MouseLeave += (s, e) => btnShowPassword.BackColor = Color.FromArgb(230, 235, 245);

            Control parent = textBox2.Parent ?? this;
            parent.Controls.Add(btnShowPassword);
            btnShowPassword.BringToFront();
        }

        private void SetupPasswordTextbox()
        {
            if (textBox2 != null)
            {
                textBox2.PasswordChar = '●';
            }
        }

        private void UpdateShowPasswordButtonPosition()
        {
            if (textBox2 == null || btnShowPassword == null) return;

            btnShowPassword.Width = 64;
            btnShowPassword.Height = textBox2.Height;
            btnShowPassword.Left = textBox2.Right + 8;
            btnShowPassword.Top = textBox2.Top;
        }

        private void BtnShowPassword_Click(object sender, EventArgs e)
        {
            isPasswordVisible = !isPasswordVisible;

            if (isPasswordVisible)
            {
                textBox2.PasswordChar = '\0';
                btnShowPassword.Text = "Hide";
            }
            else
            {
                textBox2.PasswordChar = '●';
                btnShowPassword.Text = "Show";
            }
        }

        private void Form1_Paint(object sender, PaintEventArgs e)
        {
            Rectangle rect = new Rectangle(0, 0, Width, Height);
            using (LinearGradientBrush brush = new LinearGradientBrush(
                rect,
                Color.FromArgb(94, 109, 130),
                Color.FromArgb(232, 236, 241),
                LinearGradientMode.Vertical))
            {
                e.Graphics.FillRectangle(brush, rect);
            }

            using (SolidBrush panelBrush = new SolidBrush(Color.FromArgb(245, 248, 252)))
            using (GraphicsPath path = CreateRoundedRectangle(new Rectangle(40, 70, Math.Max(420, Width - 80), Math.Max(280, Height - 150)), 20))
            {
                e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
                e.Graphics.FillPath(panelBrush, path);
            }
        }

        private GraphicsPath CreateRoundedRectangle(Rectangle rect, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            int d = radius * 2;

            path.AddArc(rect.X, rect.Y, d, d, 180, 90);
            path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
            path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
            path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
            path.CloseFigure();

            return path;
        }

        private void CreateUsersMenuItem()
        {
            if (menuStrip1 == null) return;

            bool exists = false;
            foreach (ToolStripItem item in menuStrip1.Items)
            {
                if (item is ToolStripMenuItem mi && mi.Text == "Users")
                {
                    usersToolStripMenuItem = mi;
                    exists = true;
                    break;
                }
            }

            if (!exists)
            {
                usersToolStripMenuItem = new ToolStripMenuItem();
                usersToolStripMenuItem.Name = "usersToolStripMenuItem";
                usersToolStripMenuItem.Text = "Users";
                usersToolStripMenuItem.Enabled = false;
                menuStrip1.Items.Add(usersToolStripMenuItem);
            }
        }

        private void CreateMissingCategoryMenuItems()
        {
            if (menuStrip1 == null) return;

            ToolStripMenuItem menuRoot = null;

            foreach (ToolStripItem item in menuStrip1.Items)
            {
                if (item is ToolStripMenuItem mi && mi.Text == "Menu")
                {
                    menuRoot = mi;
                    break;
                }
            }

            if (menuRoot == null) return;

            pcCasesMenuItem = FindDropDownItemByText(menuRoot, "PC Cases");
            monitorsToolStripMenuItem = FindDropDownItemByText(menuRoot, "Monitors");
            motherboardsToolStripMenuItem = FindDropDownItemByText(menuRoot, "Motherboards");
            coolerToolStripMenuItem = FindDropDownItemByText(menuRoot, "Cooler");

            if (pcCasesMenuItem == null)
            {
                pcCasesMenuItem = new ToolStripMenuItem("PC Cases");
                pcCasesMenuItem.Name = "pcCasesMenuItem";
                pcCasesMenuItem.Enabled = false;
                menuRoot.DropDownItems.Add(pcCasesMenuItem);
            }

            if (monitorsToolStripMenuItem == null)
            {
                monitorsToolStripMenuItem = new ToolStripMenuItem("Monitors");
                monitorsToolStripMenuItem.Name = "monitorsToolStripMenuItem";
                monitorsToolStripMenuItem.Enabled = false;
                menuRoot.DropDownItems.Add(monitorsToolStripMenuItem);
            }

            if (motherboardsToolStripMenuItem == null)
            {
                motherboardsToolStripMenuItem = new ToolStripMenuItem("Motherboards");
                motherboardsToolStripMenuItem.Name = "motherboardsToolStripMenuItem";
                motherboardsToolStripMenuItem.Enabled = false;
                menuRoot.DropDownItems.Add(motherboardsToolStripMenuItem);
            }

            if (coolerToolStripMenuItem == null)
            {
                coolerToolStripMenuItem = new ToolStripMenuItem("Cooler");
                coolerToolStripMenuItem.Name = "coolerToolStripMenuItem";
                coolerToolStripMenuItem.Enabled = false;
                menuRoot.DropDownItems.Add(coolerToolStripMenuItem);
            }
        }

        private ToolStripMenuItem FindDropDownItemByText(ToolStripMenuItem parent, string text)
        {
            if (parent == null) return null;

            foreach (ToolStripItem item in parent.DropDownItems)
            {
                if (item is ToolStripMenuItem mi &&
                    mi.Text.Equals(text, StringComparison.OrdinalIgnoreCase))
                {
                    return mi;
                }
            }

            return null;
        }

        private void SetMenuTextColors()
        {
            if (menuStrip1 == null) return;

            foreach (ToolStripItem item in menuStrip1.Items)
            {
                item.ForeColor = Color.White;

                if (item is ToolStripMenuItem mi)
                {
                    SetDropDownTextColorRecursive(mi);
                }
            }
        }

        private void SetDropDownTextColorRecursive(ToolStripMenuItem parent)
        {
            parent.ForeColor = Color.White;

            foreach (ToolStripItem item in parent.DropDownItems)
            {
                item.ForeColor = Color.White;

                if (item is ToolStripMenuItem child)
                {
                    SetDropDownTextColorRecursive(child);
                }
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            SetupPasswordTextbox();
            UpdateShowPasswordButtonPosition();
            SetLoggedOutUi();
            LayoutVisuals();
            Invalidate();
            SetupPasswordTextbox();
            UpdateShowPasswordButtonPosition();
            SetLoggedOutUi();

            menuStrip1.Renderer = new ToolStripProfessionalRenderer(new DarkMenuColorTable());
            SetMenuTextColors();
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            UpdateShowPasswordButtonPosition();
            LayoutVisuals();
            Invalidate();
        }

        private void LayoutVisuals()
        {
            int panelLeft = 80;
            int topBase = 120;

            if (label2 != null)
            {
                label2.Left = panelLeft;
                label2.Top = topBase;
                label2.Width = 250;
                label2.Height = 40;
            }

            if (label3 != null)
            {
                label3.Left = panelLeft;
                label3.Top = topBase + 70;
                label3.Width = 100;
                label3.Height = 24;
            }

            if (textBox1 != null)
            {
                textBox1.Left = panelLeft;
                textBox1.Top = topBase + 95;
                textBox1.Width = 280;
                textBox1.Height = 32;
            }

            if (label4 != null)
            {
                label4.Left = panelLeft;
                label4.Top = topBase + 145;
                label4.Width = 100;
                label4.Height = 24;
            }

            if (textBox2 != null)
            {
                textBox2.Left = panelLeft;
                textBox2.Top = topBase + 170;
                textBox2.Width = 280;
                textBox2.Height = 32;
            }

            UpdateShowPasswordButtonPosition();

            if (button1 != null)
            {
                button1.Left = panelLeft;
                button1.Top = topBase + 225;
                button1.Width = 352;
                button1.Height = 40;
            }

            if (label5 != null)
            {
                label5.Left = Math.Max(80, Width / 2);
                label5.Top = topBase;
                label5.Width = Math.Max(260, Width / 2 - 140);
                label5.Height = 260;
            }
        }

        private void SetAdminMenusEnabled(bool enabled)
        {
            if (cPUToolStripMenuItem != null) cPUToolStripMenuItem.Enabled = enabled;
            if (gPUToolStripMenuItem != null) gPUToolStripMenuItem.Enabled = enabled;
            if (pCCasesToolStripMenuItem != null) pCCasesToolStripMenuItem.Enabled = enabled;
            if (ramToolStripMenuItem != null) ramToolStripMenuItem.Enabled = enabled;
            if (usersToolStripMenuItem != null) usersToolStripMenuItem.Enabled = enabled;

            if (pcCasesMenuItem != null) pcCasesMenuItem.Enabled = enabled;
            if (monitorsToolStripMenuItem != null) monitorsToolStripMenuItem.Enabled = enabled;
            if (motherboardsToolStripMenuItem != null) motherboardsToolStripMenuItem.Enabled = enabled;
            if (coolerToolStripMenuItem != null) coolerToolStripMenuItem.Enabled = enabled;
        }

        private void SetLoggedOutUi()
        {
            isLoggedIn = false;
            jwtToken = null;
            isAdmin = false;

            if (loginToolStripMenuItem != null) loginToolStripMenuItem.Text = "Login";

            if (button1 != null) button1.Visible = true;
            if (textBox1 != null) textBox1.Visible = true;
            if (textBox2 != null) textBox2.Visible = true;
            if (btnShowPassword != null) btnShowPassword.Visible = true;

            if (textBox1 != null) textBox1.Text = "";
            if (textBox2 != null) textBox2.Text = "";

            isPasswordVisible = false;

            if (textBox2 != null) textBox2.PasswordChar = '●';
            if (btnShowPassword != null) btnShowPassword.Text = "Show";

            UpdateShowPasswordButtonPosition();
            SetAdminMenusEnabled(false);

            if (label2 != null) label2.Text = "Login";
            if (label3 != null) label3.Visible = true;
            if (label4 != null) label4.Visible = true;

            if (label5 != null)
            {
                label5.Visible = false;
                label5.Text = "";
            }
        }

        private void SetLoggedInUi(LoginResponse result)
        {
            isLoggedIn = true;
            jwtToken = result.token;
            isAdmin = result.user != null &&
                      !string.IsNullOrWhiteSpace(result.user.status) &&
                      result.user.status.Equals("admin", StringComparison.OrdinalIgnoreCase);

            if (loginToolStripMenuItem != null) loginToolStripMenuItem.Text = "Log out";

            if (button1 != null) button1.Visible = false;
            if (textBox1 != null) textBox1.Visible = false;
            if (textBox2 != null) textBox2.Visible = false;
            if (btnShowPassword != null) btnShowPassword.Visible = false;

            SetAdminMenusEnabled(isAdmin);

            if (label2 != null) label2.Text = "User";
            if (label3 != null) label3.Visible = false;
            if (label4 != null) label4.Visible = false;

            if (label5 != null && result.user != null)
            {
                label5.Visible = true;
                label5.Text =
                    $"USER DATA{Environment.NewLine}{Environment.NewLine}" +
                    $"ID: {result.user.userID}{Environment.NewLine}{Environment.NewLine}" +
                    $"Name: {result.user.nev}{Environment.NewLine}{Environment.NewLine}" +
                    $"Email: {result.user.email}{Environment.NewLine}{Environment.NewLine}" +
                    $"Status: {result.user.status}";
            }
        }

        public bool LoggedInCheck()
        {
            if (!isLoggedIn)
            {
                MessageBox.Show("Please log in first.");
                return false;
            }

            if (!isAdmin)
            {
                MessageBox.Show("Ehhez a menühöz csak admin férhet hozzá.");
                return false;
            }

            return true;
        }

        private void cPUToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form2().Show();
        }

        private void gPUToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form3().Show();
        }

        private void pCCasesToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form4().Show();
        }

        private void ramToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form5().Show();
        }

        private void pcCasesMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form9().Show();
        }

        private void monitorsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form6().Show();
        }

        private void motherboardsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form7().Show();
        }

        private void coolerToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new Form8().Show();
        }

        private void usersToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!LoggedInCheck()) return;
            new FormUsers(jwtToken).Show();
        }

        private void exitToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void loginToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (isLoggedIn)
            {
                SetLoggedOutUi();
                LayoutVisuals();
                return;
            }

            if (button1 != null) button1.Visible = true;
            if (textBox1 != null) textBox1.Visible = true;
            if (textBox2 != null) textBox2.Visible = true;
            if (btnShowPassword != null) btnShowPassword.Visible = true;

            isPasswordVisible = false;

            if (textBox2 != null) textBox2.PasswordChar = '●';
            if (btnShowPassword != null) btnShowPassword.Text = "Show";

            UpdateShowPasswordButtonPosition();
            LayoutVisuals();

            if (textBox1 != null) textBox1.Focus();
        }

        private async void button1_Click_1(object sender, EventArgs e)
        {
            if (isLoggedIn)
            {
                SetLoggedOutUi();
                LayoutVisuals();
                return;
            }

            string email = textBox1 != null ? textBox1.Text.Trim() : "";
            string password = textBox2 != null ? textBox2.Text.Trim() : "";

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                MessageBox.Show("Add meg az emailt és a jelszót!");
                SetLoggedOutUi();
                LayoutVisuals();
                return;
            }

            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var loginData = new { email, password };
                    string json = JsonConvert.SerializeObject(loginData);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await client.PostAsync("http://localhost:3001/api/login", content);
                    string responseBody = await response.Content.ReadAsStringAsync();

                    LoginResponse result = null;
                    if (!string.IsNullOrEmpty(responseBody))
                    {
                        result = JsonConvert.DeserializeObject<LoginResponse>(responseBody);
                    }

                    if (result != null && result.success)
                    {
                        if (result.user != null &&
                            result.user.status != null &&
                            result.user.status.Equals("admin", StringComparison.OrdinalIgnoreCase))
                        {
                            MessageBox.Show("Sikeres bejelentkezés! Admin: " + result.user.nev);
                        }
                        else if (result.user != null)
                        {
                            MessageBox.Show("Sikeres bejelentkezés! Felhasználó: " + result.user.nev);
                        }
                        else
                        {
                            MessageBox.Show("Sikeres bejelentkezés!");
                        }

                        SetLoggedInUi(result);
                        LayoutVisuals();
                    }
                    else
                    {
                        MessageBox.Show("Hibás email vagy jelszó!");
                        SetLoggedOutUi();
                        LayoutVisuals();
                    }
                }
            }
            catch (HttpRequestException)
            {
                MessageBox.Show("Nem érhető el a szerver (localhost:3001)!");
                SetLoggedOutUi();
                LayoutVisuals();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba történt:\n" + ex.Message);
                SetLoggedOutUi();
                LayoutVisuals();
            }
        }

        private class DarkMenuColorTable : ProfessionalColorTable
        {
            public override Color MenuStripGradientBegin => Color.FromArgb(30, 30, 30);
            public override Color MenuStripGradientEnd => Color.FromArgb(30, 30, 30);

            public override Color ToolStripDropDownBackground => Color.FromArgb(45, 45, 48);

            public override Color ImageMarginGradientBegin => Color.FromArgb(45, 45, 48);
            public override Color ImageMarginGradientMiddle => Color.FromArgb(45, 45, 48);
            public override Color ImageMarginGradientEnd => Color.FromArgb(45, 45, 48);

            public override Color MenuItemSelected => Color.FromArgb(0, 120, 215);
            public override Color MenuItemBorder => Color.FromArgb(0, 120, 215);

            public override Color MenuItemSelectedGradientBegin => Color.FromArgb(0, 120, 215);
            public override Color MenuItemSelectedGradientEnd => Color.FromArgb(0, 120, 215);

            public override Color MenuItemPressedGradientBegin => Color.FromArgb(60, 60, 60);
            public override Color MenuItemPressedGradientMiddle => Color.FromArgb(60, 60, 60);
            public override Color MenuItemPressedGradientEnd => Color.FromArgb(60, 60, 60);
        }
    }
}