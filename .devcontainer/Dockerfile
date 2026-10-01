# Development image: matches production on GoDaddy cPanel as closely as possible.
#   Python 3.9  (cPanel "Setup Python App" runs the backend on 3.9)
#   Node 22     (same major version used to build the frontend)
FROM node:22-bookworm-slim AS node

FROM python:3.9-slim-bookworm

# Node + npm from the official Node image
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN apt-get update \
 && apt-get install -y --no-install-recommends git openssh-client rsync mariadb-client procps less \
 && rm -rf /var/lib/apt/lists/*

ARG USERNAME=dev
RUN useradd --create-home --shell /bin/bash --uid 1000 $USERNAME \
 # Mount points for named volumes must exist (and be owned by the user) in the image
 && mkdir -p /workspace/furnace-react/node_modules /opt/venv \
 && chown -R $USERNAME:$USERNAME /workspace /opt/venv \
 # Debian's /etc/profile resets PATH in login shells; re-add the venv there too
 && echo 'export PATH=/opt/venv/bin:$PATH VIRTUAL_ENV=/opt/venv' > /etc/profile.d/venv.sh

USER $USERNAME

# Backend dependencies are baked into the image; rebuild the container after
# changing backend/requirements.txt.
COPY --chown=$USERNAME:$USERNAME backend/requirements.txt /tmp/requirements.txt
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
 && /opt/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt
ENV PATH=/opt/venv/bin:$PATH \
    VIRTUAL_ENV=/opt/venv

WORKDIR /workspace
