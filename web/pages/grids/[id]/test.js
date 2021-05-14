import Layout from "../../../components/layouts/main";

import useSWR, { mutate } from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import axios from "axios";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer, StickyError } from "../../../components/common/errors";
import {
    GridItemCreateModal,
    GridItemDeleteModal,
} from "../../../components/custom/manageGrids";

import { Card, Button, Nav, Spinner } from "react-bootstrap";

// axios request urls
const GRIDS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/grids";

function getFromLS(key) {
    let ls = {};
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

function saveToLS(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(
            "rgl-8",
            JSON.stringify({
                [key]: value,
            })
        );
    }
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class AddRemoveLayout extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            items: props.Items.map(function (item, key, list) {
                return {
                    i: item.GridItemID.toString(),
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 2,
                    name: item.GridItemName,
                };
            }),
            newCounter: 0,
            layouts: JSON.parse(props.Grid.Layout),
            serverStateLayout: {
                show: false,
                error: false,
                message: "none",
            },
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.Items !== this.props.Items) {
            console.log("updated items map");
            this.setState({
                items: this.props.Items.map(function (item, key, list) {
                    return {
                        i: item.GridItemID.toString(),
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2,
                        name: item.GridItemName,
                    };
                }),
            });
        }
    }

    resetLayout() {
        this.setState({ layouts: {} });
    }

    onLayoutChange(layout, layouts) {
        //saveToLS("layouts", layouts);
        this.setState({ layouts: layouts });
        // create the json object to post layout
        const json = JSON.stringify({
            layout: layouts,
        });
        // axios put request to save layout
        axios
            .put(`${GRIDS_URI}/${this.props.GridID}/layout`, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                console.log("reload");
                // set the server state to handle errors
                this.setState({
                    serverStateLayout: {
                        show: false,
                        error: false,
                        message: response.data.message,
                    },
                });
                // reload
                mutate(`${GRIDS_URI}/${this.props.GridID}/items`);
            })
            .catch((error) => {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: true,
                                message: error.response.data.message,
                            },
                        });
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: true,
                                message: "Error fetching api",
                            },
                        });
                    } else {
                        // check if a user error
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: false,
                                message: error.response.data.message,
                            },
                        });
                    }
                } else if (error.request) {
                    // check if a request error
                    this.setState({
                        serverStateLayout: {
                            show: true,
                            error: true,
                            message: "Error sending request to server",
                        },
                    });
                } else {
                    // check if a browser error
                    this.setState({
                        serverStateLayout: {
                            show: true,
                            error: true,
                            message: "Error in browser request",
                        },
                    });
                    console.log(error);
                }
            });
    }

    createElement(el) {
        const removeStyle = {
            position: "absolute",
            right: "2px",
            top: 0,
            cursor: "pointer",
        };

        const i = el.i;
        const name = el.name;

        return (
            <div key={i} data-grid={el}>
                <span className="text">{i}</span>

                <div className="wrap">
                    <h3>{name}</h3>
                    <Button disabled variant="primary">
                        Play
                    </Button>
                </div>

                <span className="remove" style={removeStyle}>
                    <GridItemDeleteModal
                        GridID={this.props.GridID}
                        info={{ GridItemID: i, GridItemName: name }}
                    />
                </span>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div class="d-flex">
                    <h1>{this.props.Grid.GridName}</h1>

                    <div class="ml-auto my-auto">
                        <GridItemCreateModal
                            AddItem={this.onAddItem}
                            GridID={this.props.Grid.GridID}
                        />{" "}
                        <Link
                            href={{
                                pathname: "/grids/[id]",
                                query: { id: this.props.Grid.GridID },
                            }}
                        >
                            <Button
                                href={"/grids/" + this.props.Grid.GridID}
                                variant="success"
                            >
                                View Grid
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button href="/grids">All Grids</Button>
                        </Link>
                    </div>
                </div>

                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={true}
                    isResizable={true}
                    rowHeight={100}
                    layouts={this.state.layouts}
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    {_.map(this.state.items, (el) => this.createElement(el))}
                </ResponsiveReactGridLayout>

                {/* display errors to the user */}
                {this.state.serverStateLayout.show && (
                    <StickyError
                        variant={
                            !this.state.serverStateLayout.error
                                ? "warning"
                                : "danger"
                        }
                        text={this.state.serverStateLayout.message}
                    />
                )}
            </div>
        );
    }
}

// main grid loader
const Grid = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL +
            "/app/grids/" +
            props.GridID +
            "/items",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    if (data) {
        return (
            <>
                <ErrorDisplayer error={error} />

                <AddRemoveLayout
                    Items={data.payload.items}
                    Grid={data.payload.grid}
                    GridID={props.GridID}
                ></AddRemoveLayout>
            </>
        );
    } else {
        return (
            <>
                <ErrorDisplayer error={error} />
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </>
        );
    }
};

// main app function
export default function Main() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout title="Grids">
            <Grid GridID={id} />
        </Layout>
    );
}
