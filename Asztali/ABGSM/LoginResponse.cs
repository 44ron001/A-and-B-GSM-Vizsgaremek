using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABGSM
{
    public class LoginResponse
    {
        public bool success { get; set; }
        public string token { get; set; }
        public User user { get; set; }
        public string message { get; set; }
    }
}
