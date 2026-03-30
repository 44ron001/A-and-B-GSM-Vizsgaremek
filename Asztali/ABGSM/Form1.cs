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

        public Form1()
        {
            InitializeComponent();
            DoubleBuffered = true;
            Paint += Form1_Paint;
            Load += Form1_Load;

            CreateShowPasswordButton();
            SetupPasswordTextbox();
            CreateUsersMenuItem();

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
        }

        private void CreateShowPasswordButton()
        {
            if (textBox2 == null) return;

            btnShowPassword = new Button();
            btnShowPassword.Name = "btnShowPassword";
            btnShowPassword.Text = "Show";
            btnShowPassword.Width = 60;
            btnShowPassword.Height = textBox2.Height;
            btnShowPassword.Click += BtnShowPassword_Click;

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

            btnShowPassword.Width = 60;
            btnShowPassword.Height = textBox2.Height;
            btnShowPassword.Left = textBox2.Right + 5;
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
                Color.FromArgb(135, 81, 81),
                Color.FromArgb(215, 215, 215),
                LinearGradientMode.Vertical))
            {
                e.Graphics.FillRectangle(brush, rect);
            }
        }

        private void CreateUsersMenuItem()
        {
            if (menuStrip1 == null) return;

            usersToolStripMenuItem = new ToolStripMenuItem();
            usersToolStripMenuItem.Name = "usersToolStripMenuItem";
            usersToolStripMenuItem.Text = "Users";
            usersToolStripMenuItem.Enabled = false;

            menuStrip1.Items.Add(usersToolStripMenuItem);
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            SetupPasswordTextbox();
            UpdateShowPasswordButtonPosition();
            SetLoggedOutUi();
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            UpdateShowPasswordButtonPosition();
        }

        private void SetAdminMenusEnabled(bool enabled)
        {
            if (cPUToolStripMenuItem != null) cPUToolStripMenuItem.Enabled = enabled;
            if (gPUToolStripMenuItem != null) gPUToolStripMenuItem.Enabled = enabled;
            if (pCCasesToolStripMenuItem != null) pCCasesToolStripMenuItem.Enabled = enabled;
            if (ramToolStripMenuItem != null) ramToolStripMenuItem.Enabled = enabled;
            if (usersToolStripMenuItem != null) usersToolStripMenuItem.Enabled = enabled;
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
                    "| USER DATA\n" +
                    "|\n" +
                    $"| ID: {result.user.userID}\n" +
                    "|\n" +
                    $"| Name: {result.user.nev}\n" +
                    "|\n" +
                    $"| Email: {result.user.email}\n" +
                    "|\n" +
                    $"| Status: {result.user.status}";
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

            if (textBox1 != null) textBox1.Focus();
        }

        private async void button1_Click_1(object sender, EventArgs e)
        {
            if (isLoggedIn)
            {
                SetLoggedOutUi();
                return;
            }

            string email = textBox1 != null ? textBox1.Text.Trim() : "";
            string password = textBox2 != null ? textBox2.Text.Trim() : "";

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                MessageBox.Show("Add meg az emailt és a jelszót!");
                SetLoggedOutUi();
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
                    }
                    else
                    {
                        MessageBox.Show("Hibás email vagy jelszó!");
                        SetLoggedOutUi();
                    }
                }
            }
            catch (HttpRequestException)
            {
                MessageBox.Show("Nem érhető el a szerver (localhost:3001)!");
                SetLoggedOutUi();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba történt:\n" + ex.Message);
                SetLoggedOutUi();
            }
        }
    }
}