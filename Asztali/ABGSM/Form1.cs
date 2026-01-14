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
        public Form1()
        {
            InitializeComponent();
            
            this.Size = new Size(1280, 720);
            this.StartPosition = FormStartPosition.CenterScreen;

            Button button1 = new Button();
            button1.Text = "Belepes";
            button1.Size = new Size(200, 50);
            button1.Location = new Point(300, 200);
            button1.Visible = true;
            this.Controls.Add(button1);
        }
    }
}
