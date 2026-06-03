FROM apify/actor-node:22

COPY --chown=myuser:myuser package*.json ./
RUN npm --quiet set progress=false \
  && npm install --omit=dev \
  && echo "Installed NPM packages:" \
  && npm list --omit=dev --all || true

COPY --chown=myuser:myuser . ./

CMD npm start
