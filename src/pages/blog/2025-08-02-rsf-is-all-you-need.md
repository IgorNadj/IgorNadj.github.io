---
title: 'RSF is All You Need'
layout: ../../layouts/BlogPostLayout.astro
pubDate: 2025-08-02
#tags: ['project']
---

There's a great blog post about React Server Components (RSC) called [JSX Over The Wire](https://overreacted.io/jsx-over-the-wire/).

It explains the concept behind RSC by showing that the data passed between our frontends and backends is the same data which ends up being passed to component props for rendering.
And that we can "delete" our data-fetching code by instead rendering components on the server, and passing the rendered components back to the frontend.

Given a standard component:

```tsx
export const Post = (id) => {
  const post = fetch(`/api/post/${id}`);

  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
}
```

We turn it into a React Server Component:

```tsx
export const Post = async (id) => {
  const post = await db.post.get(id);

  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
}
```

This component is rendered on the server, returned to the frontend, and inserted into the virtual dom to be displayed in the browser.

This is really cool conceptually, and makes a lot of sense, it's a whole lot less code!

But let's break this down a bit further, let's see what we're actually doing when we do this, from a software engineering point of view.

### API first

Consider our original React component:

```tsx
export const Post = (id) => {
  const post = fetch(`/api/post/${id}`);

  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
}
```

Why do we write components that fetch data from APIs?

We do this because like to keep our API and clients separate.

An API is a well-defined service, it does one thing, and it does it well.

If it was too coupled to any one client, it would start absorbing some responsibilities of the client, and become messy.

This conceptual blurring would mean developers would lose clarity on what the service is responsible for, and how or where to make changes. Leading to a slowdown of iteration speed, and if unresolved, eventual rewriting.

Instead, an API-first approach lets us work on our services one at a time, with clear conceptual models of what they do. It keeps things simple.

Ok, so we have a nice separation, but why is that line of separation here? Why between the browser and the API? Maybe just for historical reasons?

### Backend for Frontend

Suppose we move this line of separation by creating a new server closer to the API:

```typescript
// http://my-new-server
import { PostsService } from '../api/PostsService';

app.get('/Post/:id', (req, res) => {
  const { id } = req.params;
  
  const post = PostsService.get(id);
  
  res({
    post,
  })
});
```

And our frontend component becomes:

```tsx
export const Post = (id) => {
  const { post } = fetch(`http://my-new-server/Post/${id}`);

  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
}
```

This is the Backend for Frontend (BFF) model: adding a new lightweight server which is only responsible for serving the frontend.

This is still API-first: the BFF is _intentionally_ tightly coupled to the frontend, but the API is untouched.

We've just moved the line of separation: from **frontend** - **API**, to **BFF** - **API**.

This makes our components a little bit simpler, which is nice.

But what it really enables us to do, is to consider these two parts as one. We are in complete control of how we pass data between our frontend and our BFF, we are no longer limited by the API.

### A Backend for Frontend for free

With RSC, the BFF is generated from a single source file.

The file which contains a React Server Component:

```tsx
export const Post = async (id) => {
  const post = await db.post.get(id);

  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
}
```

Is split into two versions, one for the frontend:

```tsx
export const Post = (id) => callRSC('rsc_1', id);
```

And one for the BFF:

```tsx
const rsc_1 = async (id) => {
  const post = await db.post.get(id);
  
  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
}

app.use('/rsc_1', async (req, res) => {
  const { id } = req.body;
  
  const rendered = rsc_1(id);
  
  returnJsx(res, rendered);
});
```

This code splitting is required for RSC. The frontend needs a version of the code which makes an HTTP request to the BFF, and the BFF needs a version of the code which executes the function and returns data.

So two versions are generated from one source file. But conceptually, we don't need to think about this. Because we control both the FE and the BFF, we can consider it one thing, the wiring is transparent.

At least, in theory. Unfortunately, we don't get server side rendering (SSR) for free.

### The extra complexity of rendering on the server

As much as we'd like everything to be transparent, and run exactly the same on the FE and BFF, there are differences we can't ignore.

A component being rendered on the server requires careful thought.

We cannot access things that only exist in the browser, things like _localStorage_. It also doesn't make sense using _useState()_, this is a one and done thing, the BFF receives the request, does a single render, and returns it.

To get around this, we would need to start thinking as all components being server components, with no access to the browser or state, and "enhance" the ones we want to run in the browser.

E.g. we modify the component to wait for the first render in the browser before we access browser-only functionality or state:

```tsx
export const MyName = () => {
  const [name, setName] = useState(null);

  // This runs ONLY on the client, at first render
  useEffect(() => {
    setName(localStorage.getItem('name'));
  }, []);

  return <>{ name }</>
}
```

To me this seems like we're adding unnecessary complexity.

The draw of reactivity is to make rendering the UI easy. Reactivity is fundamentally about solving user interaction - when the user does something, how does the UI change? This only exists on the frontend.

Rendering on the server introduces complexity.

### That doesn't seem too bad, SSR still seems worth it?

SSR has great promise, but it also has its drawbacks and added complexity.

With SSR there are other considerations, like preventing a re-fetch of data once it renders on the frontend. Not only do you need to render the components, you also need to pass the data used to render them back to the FE so it can hydrate properly, instead of starting from scratch.

Whether it's worth it or not is up to you and your use case.

This blog post questions whether RSC (with SSR bundled by necessity) is the best way to solve a particular problem.

The premise is that SSR adds complexity, and therefore a solution which doesn't add complexity is better.

If your use case requires SSR, the premise is irrelevant, you have RSC "for free", feel free to continue as you were.

However, if you are evaluating different options to solve the problem, and you are not locked into SSR, read on.

### Keeping react reactive
We still want to "delete" our data-fetching code, so that our line of separation can be between the BFF and the API.

We still want one source file to generate two versions, one for the frontend and one for the BFF.

We also want to avoid server side rendering so that our React code can run in a reactive environment only.

One solution is to use **React Server Functions (RSF)**.

Components don't run on the server, but their "insides" do:

```tsx
import { PostsService } from '../api/PostsService';

export const Post = (id) => {
  const { post } = (() => {
    'use server';
    const post = PostsService.get(id);
    return { post };
  })();
  
  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
};
```

Ahh, much simpler!

For completion's sake, to peek behind the curtain, the generated file for the frontend looks like:

```tsx
export const Post = (id) => {
  const { post } = callRSF('rsf_1', id);
  
  return (
    <>
      <>{post.title}</>
      <>{post.body}</>
    </>
  );
};
```

And the generated file for the BFF is:

```typescript
import { PostsService } from '../api/PostsService';

const rsf_1 = (id) => {
  const post = PostsService.get(id);
  return { post };
});

app.use('/rsf_1', async (req, res) => {
  const { id } = req.body;

  const result = rsf_1(id);

  res(result);
});
```

A clean and simple solution. 
- Deletes the data-fetching layer without introducing a new concept.
- Transparently adds a BFF to move the line of separation to the server. 
- Code splitting between the frontend and the BFF is predictable and explicit.

### Real world usage

This post just covers the conceptual basics. In the real world you'd likely do things slightly differently.

Things like:
- **Caching**: you'd likely use @tanstack/query and have your server function be the query function.
- **Combining requests**: RSC solves this by rendering multiple components in the same request. E.g. an RSC Post component might have a child Comments component which is also RSC, both will be rendered on the server in the same request and the tree is returned together. This saves a network trip. RSF does not do this.
- **N+1 problem**: Neither RSC nor RSF solves this out of the box. E.g. if you have an RSC Comment component, which fetches a single comment from the database, RSC cannot combine these queries, this has to be solved by fetching the data in a parent CommentsList component, and passing the data down with props. RSF can use the same solution.
- **Mutations**: RSF is agnostic to whether you are pulling or pushing data, any function can do either or both.

An real app using RSF looks like:

```tsx
export const AddEventForm = () => {
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  
  const queryClient = useQueryClient();
  const { mutate: create } = useMutation({
    mutationFn: (event: Event) => {
      'use server';
      db.prepare("INSERT INTO event (uuid, name, date) VALUES (?, ?, ?)")
        .run(event.uuid, event.name, event.date);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const handleCreateClick = () => {
    create({
      uuid: uuidv4(),
      name,
      date,
    });
  };

  return (
    <>
      <Label>Name</Label>
      <Input
        value={input}
        onInputChange={setInput}
      />

      <Label>Date</Label>
      <DatePicker 
        value={date} 
        onChange={(date) => date && setDate(date)} 
      />
      
      <Button onClick={handleCreateClick}>Create</Button>
    </>
  );
};

```

### Making use of RSF

The big frameworks like [Next](https://nextjs.org/) support both RSC and RSF. They are SSR by default and you will need workarounds if you want to opt-out.

There are smaller frameworks like [Waku](https://waku.gg/) which are very early stages but gaining popularity as a lighter weight alternative, also SSR by default.

I've created a micro framework [RSF Zero](https://github.com/IgorNadj/rsf-zero) which only supports RSF, and nothing else.

If you would like complete control, you can implement RSF yourself relatively easily, have a look at the RSF-Zero implementation for reference, it's only 1000 lines of code, and now you understand it conceptually!
