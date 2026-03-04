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

        public Form1()
        {
            InitializeComponent();
            DoubleBuffered = true;
            Paint += Form1_Paint;

            Load += Form1_Load;

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

        private void Form1_Load(object sender, EventArgs e)
        {
            SetLoggedOutUi();
        }

        private void SetLoggedOutUi()
        {
            isLoggedIn = false;
            jwtToken = null;

            if (loginToolStripMenuItem != null) loginToolStripMenuItem.Text = "Login";

            button1.Visible = true;
            textBox1.Visible = true;
            textBox2.Visible = true;

            textBox1.Text = "";
            textBox2.Text = "";

            label2.Text = "Login";
            label3.Visible = true;
            label4.Visible = true;
            label5.Visible = false;
            label5.Text = "";
        }

        private void SetLoggedInUi(LoginResponse result)
        {
            isLoggedIn = true;
            jwtToken = result.token;

            if (loginToolStripMenuItem != null) loginToolStripMenuItem.Text = "Log out";

            button1.Visible = false;
            textBox1.Visible = false;
            textBox2.Visible = false;

            label2.Text = "User";
            label3.Visible = false;
            label4.Visible = false;
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

        public bool LoggedInCheck()
        {
            if (!isLoggedIn)
            {
                MessageBox.Show("Please log in first.");
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

            button1.Visible = true;
            textBox1.Visible = true;
            textBox2.Visible = true;
            textBox1.Focus();
        }

        private async void button1_Click_1(object sender, EventArgs e)
        {
            if (isLoggedIn)
            {
                SetLoggedOutUi();
                return;
            }

            string email = textBox1.Text.Trim();
            string password = textBox2.Text.Trim();

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
                        result = JsonConvert.DeserializeObject<LoginResponse>(responseBody);

                    if (result != null && result.success)
                    {
                        MessageBox.Show("Sikeres bejelentkezés! Üdv: " + result.user.nev);
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
                MessageBox.Show("Nem érhetõ el a szerver (localhost:3001)!");
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