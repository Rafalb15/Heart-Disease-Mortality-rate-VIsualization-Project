import socket
from flask import Flask, render_template
import sys

app = Flask(__name__)

def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]


@app.route("/")
def hello():
    return render_template("index.html")


if __name__ == "__main__":
    port = sys.argv[1]
    print ("Connect to http://{}:{} to view heart disease mortality".format(get_ip_address(), port))
    app.run(host="0.0.0.0", port=port, debug=False)
