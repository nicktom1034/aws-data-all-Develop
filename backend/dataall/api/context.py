class Context:
    def __init__(
        self,
        engine=None,
        es=None,
        username=None,
        groups=None,
        cdkproxyurl=None,
    ):
        self.engine = engine
        self.es = es
        self.username = username
        self.groups = groups
        self.cdkproxyurl = cdkproxyurl
