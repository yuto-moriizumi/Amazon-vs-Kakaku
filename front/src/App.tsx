import React from "react";
import { Image, Button, Container, Nav, Navbar, Table, Spinner } from "react-bootstrap";
import axios from "axios";

type State = {
  is_updating: boolean;
  products: Product[];
};
type Product = {
  id: number;
  name: string;
  type: string;
  url_com: string;
  url_kakaku: string;
};
export default class App extends React.Component<{}, State> {
  state = { is_updating: false, products: new Array<Product>() };
  private SERVER_HOST = process.env.REACT_APP_SERVER_URL || "SERVER_HOST";

  constructor(props: any) {
    super(props);
    axios.get(`${this.SERVER_HOST}/products`).then((res) => this.setState({ products: res.data }));
  }

  private async update() {
    // this.setState({ is_updating: true });
    // try {
    //   const res = await axios.get(`${this.SERVER_HOST}/servers`);
    //   if (res) this.setState({ products: res.data });
    //   this.state.servers.forEach((server) => {
    //     axios
    //       .get(`${this.SERVER_HOST}/servers/${server.guid}`)
    //       .catch((e) => console.log(e))
    //       .then((res) => {
    //         const res2 = res as { data: any };
    //         if (res2 === undefined) return;
    //         console.log(res2.data);
    //         this.setState({
    //           servers: this.state.servers.map((server2) => {
    //             if (server2 === server) server2.teams = res2.data;
    //             return server2;
    //           }),
    //         });
    //       });
    //   });
    // } catch (error) {
    //   console.log(error);
    // } finally {
    //   this.setState({ isUpdate: false });
    // }
  }
  // private getTicketDiff(teams: Team[]) {
  //   if (!(teams instanceof Array) || teams.length < 2) return <>NONE</>;
  //   //降順に整列
  //   const sorted_teams = teams.sort((a, b) => b.ticket - a.ticket);
  //   const obj = { winner: sorted_teams[0].name, diff: sorted_teams[0].ticket - sorted_teams[1].ticket };
  //   return (
  //     <>
  //       <p className="mb-0">優勢：{obj.winner}</p>
  //       <p className="mb-0">差：{obj.diff}</p>
  //     </>
  //   );
  // }
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
        </Container>
      </>
    );
  }
}
