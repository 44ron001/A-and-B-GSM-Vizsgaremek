using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ABGSM
{
    public partial class Form1 : Form
    {
        public bool isLoggedIn = false;

        public Form1()
        {
            InitializeComponent();
        }

        private void label1_Click(object sender, EventArgs e)
        {
            string username = textBox1.Text;
            MessageBox.Show("Welcome " + username + " to A&B GSM!");
            isLoggedIn = true;
        }

        private void panel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void textBox1_TextChanged(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            LoggedInCheck();
        }

        public void LoggedInCheck()
        {
            if (!isLoggedIn)
            {
                MessageBox.Show("Please log in first.");
                return;
            }
        }
    }
}
