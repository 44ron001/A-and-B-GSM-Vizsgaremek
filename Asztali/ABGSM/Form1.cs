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

        public Form1()
        {
            InitializeComponent();
            this.DoubleBuffered = true;
            this.Paint += Form1_Paint;
        }

        private void Form1_Paint(object sender, PaintEventArgs e)
        {
            Rectangle rect = new Rectangle(0, 0, this.Width, this.Height);

            using (LinearGradientBrush brush = new LinearGradientBrush(
                rect,
                Color.FromArgb(135, 81, 81),
                Color.FromArgb(215, 215, 215),
                LinearGradientMode.Vertical))
            {
                e.Graphics.FillRectangle(brush, rect);
            }
        }

        public void LoggedInCheck()
        {
            if (!isLoggedIn)
            {
                MessageBox.Show("Please log in first.");
                return;
            }
        }

        Size lastSize;

        private void Form1_Load(object sender, EventArgs e)
        {
            lastSize = this.Size;
        }

        private void cPUToolStripMenuItem_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form2 form2 = new Form2();
                form2.Show();
            };
        }

        private void gPUToolStripMenuItem_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form3 form3 = new Form3();
                form3.Show();
            };
        }

        private void pCCasesToolStripMenuItem_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form4 form4 = new Form4();
                form4.Show();
            };
        }

        private void ramToolStripMenuItem_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form5 form5 = new Form5();
                form5.Show();
            };
        }

        private void exitToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            
        }

        async void button1_Click_1(object sender, EventArgs e)
        {
            string email = textBox1.Text.Trim();
            string password = textBox2.Text.Trim();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                MessageBox.Show("Add meg az emailt és a jelszót!");
                isLoggedIn = false;
                return;
            }

            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var loginData = new
                    {
                        email = email,
                        password = password
                    };

                    string json = JsonConvert.SerializeObject(loginData);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await client.PostAsync(
                        "http://localhost:3001/api/login",
                        content
                    );

                    string responseBody = await response.Content.ReadAsStringAsync();

                    LoginResponse result = null;

                    if (!string.IsNullOrEmpty(responseBody))
                    {
                        result = JsonConvert.DeserializeObject<LoginResponse>(responseBody);
                    }

                    if (result != null && result.success)
                    {
                        isLoggedIn = true;

                        MessageBox.Show("Sikeres bejelentkezés! Üdv: " + result.user.nev);

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
                    else
                    {
                        isLoggedIn = false;

                        MessageBox.Show("Hibás email vagy jelszó!");
                    }
                }
            }
            catch (HttpRequestException)
            {
                isLoggedIn = false;
                MessageBox.Show("Nem érhetõ el a szerver (localhost:3001)!");
            }
            catch (Exception ex)
            {
                isLoggedIn = false;
                MessageBox.Show("Hiba történt:\n" + ex.Message);
            }
        }
    }
}
