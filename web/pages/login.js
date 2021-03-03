import Layout from "../components/layouts/base";

import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";

import { FormExample } from "../components/custom/loginForm";

export default function Main() {
    return (
        <Layout title="Home">
            <Jumbotron fluid>
                <Container>
                    <h1>Whizz Player</h1>
                    <Badge className="mb-2" variant="primary">
                        {process.env.NEXT_PUBLIC_VERSION}
                    </Badge>
                    <Badge className="ml-1 mb-2" variant="success">
                        By Nathan Rignall
                    </Badge>
                    <p>
                        Track scheduler system, create cues and upload audio
                        files to schedule audio playback
                    </p>
                </Container>
            </Jumbotron>

            <Container>
                <h2>Login</h2>
                <p>Please fill in your credentials to login.</p>

                <FormExample />
            </Container>
        </Layout>
    );
}
