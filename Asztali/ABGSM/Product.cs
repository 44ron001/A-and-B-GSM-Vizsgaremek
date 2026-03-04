using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABGSM
{
    public class Product
    {
        public int pID { get; set; }
        public string nev { get; set; }
        public int ar { get; set; }
        public string leiras { get; set; }
        public int keszlet { get; set; }
        public Dictionary<string, string> attributes { get; set; }
        public List<ProductImage> images { get; set; }
    }
}
