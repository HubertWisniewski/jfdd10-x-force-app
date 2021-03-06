import React, { Component } from "react";
import { Route, NavLink, withRouter } from "react-router-dom";
import BadgesView from "../BadgesView/BadgesView";
import BadgeView from "../BadgeView/BadgeView";
import { Button, Modal, Header, Image } from "semantic-ui-react";
import HomeView from "../HomeView/HomeView";
import BadgeDealersView from "../BadgeDealersView/BadgeDealersView";
import BadgeDealerView from "../BadgeDealerView/BadgeDealerView";
import SignUpFormView from "../SignUpFormView/SignUpFormView";
import SignInFormView from "../SignInFormView/SignInFormView";
import UserProfileView from "../UserProfileView/UserProfileView";
import firebase from "firebase";
import "./App.css";
import { getBadges } from "../../services/badges";
import { getUsers } from "../../services/users";
import { getDealers } from "../../services/dealers";
import UserProfileFormEdit from "../UserProfileFormEdit/UserProfileFormEdit";

class App extends Component {
  state = {
    badges: null,
    dealers: null,
    users: null,
    user: null,
    signInOpen: false,
    SignUpOpen: false
  };

  signInShow = signInDimmer => () =>
    this.setState({ signInDimmer, signInOpen: true });
  signInClose = () => this.setState({ signInOpen: false });

  SignUpShow = SignUpDimmer => () =>
    this.setState({ SignUpDimmer, SignUpOpen: true });
  SignUpClose = () => this.setState({ SignUpOpen: false });

  componentDidMount() {
    getBadges().then(badges => this.setState({ badges }));
    getUsers().then(users => this.setState({ users }));
    getDealers().then(dealers => {
      this.setState({ dealers });
    });

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .database()
          .ref("/users/" + user.uid)
          .once("value")
          .then(snapshot => {
            let fetchedUser = { uid: user.uid, ...(snapshot.val() || {}) };
            if (fetchedUser.isTrainer) {
              firebase
                .database()
                .ref("/dealers/" + user.uid)
                .once("value")
                .then(snapshot => {
                  this.setState({
                    user: { ...fetchedUser, ...snapshot.val() }
                  });
                });
            } else {
              this.setState({ user: fetchedUser });
            }
          });
      }
    });
  }

  logOut = () => {
    firebase
      .auth()
      .signOut()
      .then(
        () => {
          this.setState({
            user: null
          });
        },
        function(error) {
          console.warn("error");
        }
      )
      .then(() => this.props.history.push("/"));
  };

  render() {
    const { user } = this.state;
    const { signInOpen, signInDimmer } = this.state;
    const { SignUpOpen, dimmer2 } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <div className="App">
            <div className="navigation">
              <ul>
                {user ? (
                  <li>
                    <Button inverted color="blue" onClick={() => this.logOut()}>
                      Wylogowanie
                    </Button>
                  </li>
                ) : (
                  <>
                    <li>
                      <Button
                        onClick={this.signInShow("blurring")}
                        inverted
                        color="blue"
                      >
                        Rejestracja
                      </Button>
                    </li>
                    <li>
                      <Button
                        onClick={this.SignUpShow("blurring")}
                        inverted
                        color="blue"
                      >
                        Logowanie
                      </Button>
                    </li>
                  </>
                )}

                <li>
                  <Button inverted color="blue">
                    <NavLink className="links" exact to="/">
                      Główna
                    </NavLink>
                  </Button>
                </li>
                <li>
                  <Button inverted color="blue">
                    <NavLink className="links" to="/badges">
                      Odznaki
                    </NavLink>
                  </Button>
                </li>
                <li>
                  <Button inverted color="blue">
                    <NavLink className="links" to="/badge-dealers">
                      Trenerzy
                    </NavLink>
                  </Button>
                </li>
                {user ? (
                  <li>
                    <Button inverted color="blue">
                      <NavLink className="links" to="/user-profile">
                        Mój profil
                      </NavLink>
                    </Button>
                  </li>
                ) : null}
              </ul>
            </div>

            <Route
              exact
              path="/"
              component={() => <HomeView badges={this.state.badges} />}
            />
            <Route
              exact
              path="/badges"
              component={() => <BadgesView badges={this.state.badges} />}
            />
            <Route
              path="/badges/:badgeId"
              component={({
                match: {
                  params: { badgeId }
                }
              }) => (
                <BadgeView
                  badge={this.state.badges && this.state.badges[badgeId]}
                  dealers={this.state.dealers}
                />
              )}
            />
            <Route
              exact
              path="/badge-dealers"
              component={() => (
                <BadgeDealersView
                  dealers={this.state.dealers}
                  badges={this.state.badges}
                />
              )}
            />
            <Route
              path="/badge-dealers/:dealerId"
              component={({
                match: {
                  params: { dealerId }
                }
              }) => (
                <BadgeDealerView
                  badges={this.state.badges}
                  dealers={this.state.dealers}
                  dealerId={dealerId}
                />
              )}
            />
            <Route path="/sign-up" component={SignUpFormView} />
            <Route path="/sign-in" component={SignInFormView} />

            {user ? (
              <Route
                path="/user-profile"
                component={() => (
                  <UserProfileView
                    dealers={this.state.dealers}
                    user={this.state.user}
                    badges={this.state.badges}
                  />
                )}
              />
            ) : null}
          </div>
        </header>
        <Modal
          dimmer={signInDimmer}
          open={signInOpen}
          onClose={this.signInClose}
        >
          <Modal.Header>Register</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <Header>Register</Header>
              <SignUpFormView afterSignUpSuccess={this.signInClose} />
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={this.signInClose}>
              Close
            </Button>
          </Modal.Actions>
        </Modal>
        <Modal dimmer={dimmer2} open={SignUpOpen} onClose={this.SignUpClose}>
          <Modal.Header>Logowanie</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <Header>Logowanie</Header>
              <SignInFormView afterSignInSuccess={this.SignUpClose} />
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={this.SignUpClose}>
              Close
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}
export default withRouter(App);
