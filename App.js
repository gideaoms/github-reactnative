import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  TouchableOpacity,
  AsyncStorage
} from "react-native";
import Repo from "./src/components/Repo";
import NewRepoModal from "./src/components/NewRepoModal";

export default class App extends Component {
  state = {
    modalVisible: false,
    repos: []
  };

  async componentDidMount() {
    const repos =
      (await JSON.parse(
        await AsyncStorage.getItem("@appgithub:repositories")
      )) || [];
    this.setState({ repos });
  }

  addRepository = async newRepoText => {
    try {
      const repoCall = await fetch(
        `https://api.github.com/repos/${newRepoText}`
      );
      const response = await repoCall.json();
      const repository = {
        id: response.id,
        thumbnail: response.owner.avatar_url,
        title: response.name,
        author: response.owner.login
      };

      this.setState({
        modalVisible: false,
        repos: [...this.state.repos, repository]
      });
    } catch (err) {
      alert(`O repositório ${newRepoText} não foi encontrado`);
    }

    await AsyncStorage.setItem(
      "@appgithub:repositories",
      JSON.stringify(this.state.repos)
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Github Projects</Text>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
          >
            <Text style={styles.headerButton}>+</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.repoList}>
          {this.state.repos.map(repo => <Repo key={repo.id} data={repo} />)}
        </ScrollView>
        <NewRepoModal
          onCancel={() => this.setState({ modalVisible: false })}
          onAdd={this.addRepository}
          visible={this.state.modalVisible}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333"
  },
  header: {
    height: Platform.OS === "ios" ? 70 : 50,
    paddingTop: Platform.OS === "ios" ? 20 : 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },
  headerButton: {
    fontSize: 36,
    fontWeight: "bold"
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  repoList: {
    padding: 20
  }
});
