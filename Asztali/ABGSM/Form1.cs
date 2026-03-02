using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Drawing.Drawing2D;

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

        private void label1_Click(object sender, EventArgs e)
        {
            string username = textBox1.Text;
            MessageBox.Show("Welcome " + username + " to A&B GSM!");
            isLoggedIn = true;
            button1.Visible = false;
            textBox1.Visible = false;
            textBox2.Visible = false;
            label2.Text = "User";
            label3.Visible = false;
            label4.Visible = false;
            label5.Visible = true;
            label5.Text = "| username: \n" + "| " + username;
			// szia bence profi programozo
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

        private void textBox1_TextChanged(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn) 
            {
                Form2 form2 = new Form2();
                form2.Show();
            };
        }

        private void button3_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form3 form3 = new Form3();
                form3.Show();
            };
        }

        private void button4_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form4 form4 = new Form4();
                form4.Show();
            };
        }

        private void button7_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
            if (isLoggedIn)
            {
                Form5 form5 = new Form5();
                form5.Show();
            };
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
    }
}
