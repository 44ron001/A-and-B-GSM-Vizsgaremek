using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABGSM
{
    public class Order
    {
        public int orderID { get; set; }
        public DateTime datum { get; set; }
        public string allapot { get; set; }
        public int osszeg { get; set; }
    }
}
