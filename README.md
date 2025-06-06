# nrl-consumer-api

![Build](https://github.com/NHSDigital/nrl-consumer-api/workflows/Build/badge.svg?branch=master)

This is a specification for the *nrl-consumer-api* API.

* `specification/` This [Open API Specification](https://swagger.io/docs/specification/about/) describes the endpoints, methods and messages exchanged by the API. Use it to generate interactive documentation; the contract between the API and its consumers.
* `scripts/` Utilities helpful to developers of this specification.
* `proxies/` Live (connecting to another service) and sandbox (using the sandbox container) Apigee API Proxy definitions.

Consumers of the API will find developer documentation on the [NHS Digital Developer Hub](https://digital.nhs.uk/developer).

## Contributing
Contributions to this project are welcome from anyone, providing that they conform to the [guidelines for contribution](https://github.com/NHSDigital/nrl-consumer-api/blob/master/CONTRIBUTING.md) and the [community code of conduct](https://github.com/NHSDigital/nrl-consumer-api/blob/master/CODE_OF_CONDUCT.md).

### Licensing
This code is dual licensed under the MIT license and the OGL (Open Government License). Any new work added to this repository must conform to the conditions of these licenses. In particular this means that this project may not depend on GPL-licensed or AGPL-licensed libraries, as these would violate the terms of those libraries' licenses.

The contents of this repository are protected by Crown Copyright (C).

## Development

### Requirements
* make
* nodejs + npm/yarn
* [poetry](https://github.com/python-poetry/poetry)
* Java 8+

### Install
```
$ make install
```

#### Updating hooks
You can install some pre-commit hooks to ensure you can't commit invalid spec changes by accident. These are also run
in CI, but it's useful to run them locally too.

```
$ make install-hooks
```

### Environment Variables
Various scripts and commands rely on environment variables being set. These are documented with the commands.

:bulb: Consider using [direnv](https://direnv.net/) to manage your environment variables during development and maintaining your own `.envrc` file - the values of these variables will be specific to you and/or sensitive.

### Make commands
There are `make` commands that alias some of this functionality:
 * `lint` -- Lints the spec and code
 * `publish` -- Outputs the specification as a **single file** into the `build/` directory
 * `serve` -- Serves a preview of the specification in human-readable format

### Testing
# Local Testing:
In order to test locally there are a few tweaks needed. Firstly you'll need to amend the producer.yaml file to include you're PR API proxy (this gets built and release for a Github PR for your branch). Once you have a PR and the workflows are passing meaning it has been built you're ready to test. All PR endpoints will look like the below example with the PR number added onto the URL.

1. Under the servers in the yaml add you're API proxy endpoint like so:
  `- url: https://internal-dev-sandbox.api.service.nhs.uk/record-locator/consumer-pr-193/FHIR/R4`
    `description: Local test environment.`

2. Once this has been added you'll want to run a `make publish` command which will output the yaml file as a JSON into the `build/` directory.

3. Once the JSON file exists you can run a `docker` command to run the Swagger in your localhost with this command `make run`

4. Once that is done you should see the documentation appear when you go to your browser and go to `localhost:8080`. Once here when you reach the API endpoints at the bottom you will see a dropdown called Servers. Select the URL that you added in step 1 and it will now use your PR API Proxy Endpoint. Congrats you have earned yourself more fun by learning to locally test the API Proxy, have fun!

Each API and team is unique. We encourage you to use a `test/` folder in the root of the project, and use whatever testing frameworks or apps your team feels comfortable with. It is important that the URL your test points to be configurable. We have included some stubs in the Makefile for running tests.

### VS Code Plugins

 * [openapi-lint](https://marketplace.visualstudio.com/items?itemName=mermade.openapi-lint) resolves links and validates entire spec with the 'OpenAPI Resolve and Validate' command
 * [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) provides sidebar navigation


### Emacs Plugins

 * [**openapi-yaml-mode**](https://github.com/esc-emacs/openapi-yaml-mode) provides syntax highlighting, completion, and path help

### Speccy

> [Speccy](http://speccy.io/) *A handy toolkit for OpenAPI, with a linter to enforce quality rules, documentation rendering, and resolution.*

Speccy does the lifting for the following npm scripts:

 * `test` -- Lints the definition
 * `publish` -- Outputs the specification as a **single file** into the `build/` directory
 * `serve` -- Serves a preview of the specification in human-readable format

(Workflow detailed in a [post](https://developerjack.com/blog/2018/maintaining-large-design-first-api-specs/) on the *developerjack* blog.)

:bulb: The `publish` command is useful when uploading to Apigee which requires the spec as a single file.

### Caveats

#### Swagger UI
Swagger UI unfortunately doesn't correctly render `$ref`s in examples, so use `speccy serve` instead.

#### Apigee Portal
The Apigee portal will not automatically pull examples from schemas, you must specify them manually.

### Platform setup

As currently defined in your `proxies` folder, your proxies do pretty much nothing.
Telling Apigee how to connect to your backend requires a *Target Server*, which you should call named `nrl-consumer-api-target`.
Our *Target Servers* defined in the [api-management-infrastructure](https://github.com/NHSDigital/api-management-infrastructure) repository.

:bulb: For Sandbox-running environments (`test`) these need to be present for successful deployment but can be set to empty/dummy values.

### Detailed folder walk through
To get started developing your API use this template repo alongside guidance provided by the [API Producer Zone confluence](https://nhsd-confluence.digital.nhs.uk/display/APM/Deliver+your+API)

#### `/.github`:

This folder contains templates that can be customised for items such as opening pull requests or issues within the repo

`/.github/workflows`: This folder contains templates for github action workflows such as:
- `pr-lint.yaml`: This workflow template shows how to link Pull Request's to Jira tickets and runs when a pull request is opened.
- `continuous-integration.yml`: This workflow template shows how to publish a Github release when pushing to master.

#### `/azure`:

Contains templates defining Azure Devops pipelines. By default the following pipelines are available:
-  `azure-build-pipeline.yml`: Assembles the contents of your repository into a single file ("artifact") on Azure Devops and pushes any containers to our Docker registry. By default this pipeline is enabled for all branches.
- `azure-pr-pipeline.yml`: Deploys ephemeral versions of your proxy/spec to Apigee (and docker containers on AWS) to internal environments. You can run automated and manual tests against these while you develop. By default this pipeline will deploy to internal-dev, but the template can be amended to add other environments as required.
- `azure-release-pipeline.yml`: Deploys the long-lived version of your pipeline to internal and external environments, typically when you merge to master.

The `project.yml` file needs to be populated with your service names to make them available to the pipelines

`/azure/templates`: Here you can define reusable actions, such as running tests, and call these actions during Azure Devops pipelines. 

#### `/proxies`:

This folder contains files relating to your Apigee API proxy.

There are 2 folders `/live` and `/sandbox` allowing you to define a different proxy for sandbox use. By default, this sandbox proxy is implemented to route to the sandbox target server.

Within the `live/apiproxy` and `sandbox/apiproxy` folders are:

`/proxies/default.xml`: Defines the proxy's Flows. Flows define how the proxy should handle different requests. By default, _ping and _status endpoint flows are defined.
See the APM confluence for more information on how the [_ping](https://nhsd-confluence.digital.nhs.uk/display/APM/_ping+endpoint) and [_status](https://nhsd-confluence.digital.nhs.uk/display/APM/_status+endpoint) endpoints work.

`/policies`: Populated with a set of standard XML Apigee policies that can be used in flows.

`/resources/jsc`: Snippets of javascript code that are used in Apigee Javascript policies. For more info about Javascript policies see [here](https://docs.apigee.com/api-platform/reference/policies/javascript-policy)

`/targets`: The XMLs within these folders set up target definitions which allow connections to external target servers. The sandbox target definition is implemented to route to the sandbox target server (code for this sandbox is found under /sandbox of this template repo). For more info on setting up a target server see the [API Producer Zone confluence](https://nhsd-confluence.digital.nhs.uk/display/APM/Setting+up+a+target+server)

#### `/scripts`:

Contains useful scripts that are used throughout the project, for example in Makefile and Github workflows

#### `/specification`:

Create an OpenAPI Specification to document your API. For more information about developing specifications see the [API Producer Zone confluence](https://nhsd-confluence.digital.nhs.uk/display/APM/Documenting+your+API).

#### `Makefile`:
Useful make targets to get started including: installing dependencies and running smoke tests.

#### `ecs-proxies-containers.yml ` and `ecs-proxies-deploy.yml`:

These files are required to deploy containers alongside your Apigee proxy during the Azure Devops `azure-build-pipeline`.

`ecs-proxies-containers.yml`: The path to a container's Dockerfile is defined here. This path needs to be defined to allow containers to be pushed to our repository during the `azure-build-pipeline`.

`ecs-proxies-deploy.yml` : Here you can define config for your container deployment.  

For more information about deploying ECS containers see the [API Producer Zone confluence](https://nhsd-confluence.digital.nhs.uk/display/APM/Developing+ECS+proxies#DevelopingECSproxies-Buildingandpushingdockercontainers ).

#### `manifest_template.yml`:

This file defines 2 dictionaries of fields that are required for the Apigee deployment. For more info see the [API Producer Zone confluence](https://nhsd-confluence.digital.nhs.uk/display/APM/Manifest.yml+reference ).

#### Package management:

This template uses poetry for python dependency management, and uses these files: poetry.lock, poetry.toml, pyproject.toml.

Node dependencies of this template project and some npm scripts are listed in: package.json, package-lock.json.

## How to run the tests

Before you can run any tests you need to setup your Apigee token, this can be done as shown:

- Install and first time setup of [Apigee’s `get_token`](https://docs.apigee.com/api-platform/system-administration/using-gettoken) (make sure to set `export SSO_LOGIN_URL=“https://login.apigee.com”` before setup, and your username and password are the same credentials you use for logging into Apigee).

Then export the following env var:

- export APIGEE_ACCESS_TOKEN=$(get_token)

----

If you want to run the smoke tests against a particular product or app then you can set up the command like this:

Example using for the current product deployed to `internal-dev`:

`pytest tests/smoke_tests.py::test_smoke --proxy-name="nrl-consumer-api-internal-dev" --api-name=nrl-consumer-api`

Example using the product deployed for GitHub pull request 15:

`pytest tests/smoke_tests.py::test_smoke --proxy-name="nrl-consumer-api-pr-15" --api-name=nrl-consumer-api`


## Sandbox data

The public sandbox ("Try this API") endpoints come with:

* Pre-loaded data: see [cron/seed_sandbox/data/document-pointer.json](https://github.com/NHSDigital/NRLF/blob/main/cron/seed_sandbox/data/document-pointer.json)
* Pre-configured organization permissions: [ConnectionMetadata.SetRequestHeaders.js](proxies/sandbox/apiproxy/resources/jsc/ConnectionMetadata.SetRequestHeaders.js)

Developers should make sure that these align according to any user journeys that they envisage.

Additionally, and less importantly, there are:

* Fixed organization details: see [ClientRPDetailsHeader.SetRequestHeaders.js](proxies/sandbox/apiproxy/resources/jsc/ClientRPDetailsHeader.SetRequestHeaders.js)
