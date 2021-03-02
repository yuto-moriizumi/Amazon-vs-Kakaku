import React from "react";
import { Button, Container, Nav, Navbar, Table, Spinner } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type State = {
  is_updating: boolean;
  products: Product[];
  is_adding: boolean;
};
type Product = {
  id: number;
  name: string;
  type: string;
  url_com: string;
  url_kakaku: string;
};
export default class App extends React.Component<{}, State> {
  state = { is_updating: false, products: new Array<Product>(), is_adding: false };
  private SERVER_HOST = process.env.REACT_APP_SERVER_URL || "SERVER_HOST";

  componentDidMount() {
    this.update();
  }

  private async update() {
    this.setState({ is_updating: true });
    try {
      const res = await axios.get(`${this.SERVER_HOST}/products`);
      console.log(res.data);
      this.setState({ products: res.data });
      // this.state.products.forEach((product) => {
      //   // console.log(this.getAmazonPrice(product.url_com));
      // });
    } catch (error) {
      console.log(error);
    }
    this.setState({ is_updating: false });
  }

  private getAmazonPrice(url: string) {
    axios.get(url).then((res) => {
      // const document = new JSDOM(res.data).window.document;
      // const hover = document.getElementById("a-popover-content-4");
      // // const price_spans = hover?.getElementsByClassName("a-size-base a-color-base");
      // if (!price_spans) return;
      // console.log(price_spans[0]);
      // for (const price_span of price_spans) {
      // }
      // Array.from(price_spans).forEach((price_span) => {
      //   //   console.log(price_span.textContent);
      // });
    });
  }

  render() {
    return (
      <>
        <Navbar bg="light" expand="sm">
          <Navbar.Brand>
            <h1>Amazon.com vs 価格.com</h1>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto"></Nav>
          </Navbar.Collapse>
        </Navbar>
        <Container className="text-center">
          <Button
            size="lg"
            className="my-4"
            disabled={this.state.is_updating}
            onClick={(e) => {
              this.update();
            }}
          >
            {this.state.is_updating ? <Spinner animation="border" /> : "更新"}
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>商品名</th>
                <th>種類</th>
                <th>Amazon.com URL</th>
                <th>価格.com URL</th>
              </tr>
            </thead>
            <tbody>
              {this.state.products.map((product) => {
                return (
                  <tr key={product.id}>
                    <td className="p-1">{product.name}</td>
                    <td className="p-1">{product.type}</td>
                    <td className="p-1">{product.url_com}</td>
                    <td className="p-1">{product.url_kakaku}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Button
            size="lg"
            className="my-4"
            disabled={this.state.is_adding}
            onClick={() => {
              const new_product = {
                name: "name",
                type: "type",
                url_com: "url_com",
                url_kakaku: "url_kakaku",
              };
              this.setState({ is_adding: true });
              axios
                .post(`${this.SERVER_HOST}/products`, new_product)
                .then((res) => {
                  const data = res.data as { id: number };
                  console.log(data);
                  this.setState({ products: this.state.products.concat([{ id: data.id, ...new_product }]) });
                })
                .catch((e) => console.log(e))
                .finally(() => this.setState({ is_adding: false }));
            }}
          >
            {this.state.is_adding ? <Spinner animation="border" /> : <FontAwesomeIcon icon={faPlus} />}
          </Button>
        </Container>
      </>
    );
  }
}
